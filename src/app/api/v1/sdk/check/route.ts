import { NextRequest, NextResponse } from 'next/server';
import type { SDKCheckRequest, SDKCheckResponse } from '@/types';
import { createServiceClient } from '@/lib/supabase/server';
import { getLoopCounter, getCurrentMonthSpent } from '@/lib/upstash';
import { calculateCost, getModelPricing } from '@/lib/token-pricing';
import { generateRequestId, verifyApiKey } from '@/lib/utils';
import { z } from 'zod';

const checkRequestSchema = z.object({
  model: z.string(),
  provider: z.enum(['openai', 'anthropic', 'google']),
  estimated_tokens: z.number().positive(),
  request_hash: z.string(),
  context_count: z.number().nonnegative(),
});

// SDK check API — 2초 타임아웃, allow-through on error
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // 1. 요청 파싱
    let body: SDKCheckRequest;
    try {
      body = checkRequestSchema.parse(await request.json());
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid request body',
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // 2. API Key 검증
    const apiKey = request.headers.get('X-LLM-Guard-Key');
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_API_KEY',
            message: 'Missing X-LLM-Guard-Key header',
            requestId,
          },
        },
        { status: 401 }
      );
    }

    const supabase = await createServiceClient();

    // 키 해시로 프로젝트 조회
    const { data: apiKeyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('id, project_id, user_id, key_hash, is_active')
      .eq('key_prefix', apiKey.substring(0, 13))
      .single();

    if (keyError || !apiKeyRecord) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid API key',
            requestId,
          },
        },
        { status: 401 }
      );
    }

    if (!apiKeyRecord.is_active) {
      return NextResponse.json(
        {
          error: {
            code: 'API_KEY_DISABLED',
            message: 'API key is disabled',
            requestId,
          },
        },
        { status: 403 }
      );
    }

    // bcrypt 검증
    const keyValid = await verifyApiKey(apiKey, apiKeyRecord.key_hash);
    if (!keyValid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid API key',
            requestId,
          },
        },
        { status: 401 }
      );
    }

    // 3. 프로젝트 & 예산 조회
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, budget_usd, reset_day, is_active')
      .eq('id', apiKeyRecord.project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
            requestId,
          },
        },
        { status: 404 }
      );
    }

    if (!project.is_active) {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_INACTIVE',
            message: 'Project is inactive',
            requestId,
          },
        },
        { status: 403 }
      );
    }

    // 4. 예상 비용 계산
    const pricing = getModelPricing(body.provider, body.model);
    const estimatedCost = pricing
      ? calculateCost(body.provider, body.model, body.estimated_tokens, 0)
      : 0;

    // 5. Redis에서 누적 비용 조회 (DB fallback)
    let currentSpent = await getCurrentMonthSpent(project.id);
    if (currentSpent === 0) {
      // Redis miss — DB에서 조회
      const { data: budgetRecord } = await supabase
        .from('budgets')
        .select('spent_usd')
        .eq('project_id', project.id)
        .gte('period_start', new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      currentSpent = budgetRecord?.spent_usd ?? 0;
    }

    const remainingBudget = project.budget_usd - currentSpent;
    const allowed = estimatedCost <= remainingBudget;

    // 6. 루프 감지
    const loopCount = await getLoopCounter(project.id, body.request_hash);
    const loopDetected = loopCount >= 10;

    // 응답 생성
    const response: SDKCheckResponse = {
      allowed: allowed && !loopDetected,
      current_spend_usd: currentSpent,
      budget_usd: project.budget_usd,
      remaining_usd: Math.max(0, remainingBudget),
      estimated_cost_usd: estimatedCost,
      reason: !allowed ? 'budget_exceeded' : loopDetected ? 'loop_detected' : undefined,
    };

    // 로그: last_used_at 업데이트 (비동기, fire-and-forget)
    supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyRecord.id)
      .then()
      .catch(() => {}); // 무시

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // 예상치 못한 에러: allow-through (가용성 우선)
    console.error('[SDK Check Error]', error);

    return NextResponse.json(
      {
        allowed: true, // 서비스 장애 시 원본 LLM 호출 차단 금지
        current_spend_usd: 0,
        budget_usd: 0,
        remaining_usd: 0,
      },
      { status: 200 }
    );
  }
}
