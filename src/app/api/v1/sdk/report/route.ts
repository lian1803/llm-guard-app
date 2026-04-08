import { NextRequest, NextResponse } from 'next/server';
import type { SDKReportRequest } from '@/types';
import { createServiceClient } from '@/lib/supabase/server';
import { incrementSpent } from '@/lib/upstash';
import { generateRequestId, verifyApiKey, getMonthPeriodStart } from '@/lib/utils';
import { z } from 'zod';

const reportRequestSchema = z.object({
  model: z.string(),
  provider: z.enum(['openai', 'anthropic', 'google']),
  input_tokens: z.number().nonnegative(),
  output_tokens: z.number().nonnegative(),
  cost_usd: z.number().nonnegative(),
  latency_ms: z.number().nonnegative(),
  is_blocked: z.boolean(),
  request_hash: z.string(),
});

// SDK report API — fire-and-forget (비동기)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // 1. 요청 파싱
    let body: SDKReportRequest;
    try {
      body = reportRequestSchema.parse(await request.json());
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

    // 키 조회 및 검증
    const { data: apiKeyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('id, project_id, user_id, key_hash, is_active')
      .eq('key_prefix', apiKey.substring(0, 13))
      .single();

    if (keyError || !apiKeyRecord || !apiKeyRecord.is_active) {
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

    // 3. 즉시 200 반환 (fire-and-forget)
    // 실제 DB write는 백그라운드에서 진행
    const response = NextResponse.json({ received: true }, { status: 200 });

    // 4. 비동기 처리 (응답 후 진행)
    // Note: Vercel Serverless Function 실행 시간 내에 완료되어야 함
    (async () => {
      try {
        // 4a. usage_log 기록
        const { error: logError } = await supabase
          .from('usage_logs')
          .insert({
            project_id: apiKeyRecord.project_id,
            user_id: apiKeyRecord.user_id,
            model: body.model,
            provider: body.provider,
            input_tokens: body.input_tokens,
            output_tokens: body.output_tokens,
            cost_usd: body.cost_usd,
            is_blocked: body.is_blocked,
            block_reason: body.is_blocked ? 'budget_exceeded' : null,
            request_hash: body.request_hash,
            latency_ms: body.latency_ms,
            called_at: new Date().toISOString(),
          });

        if (logError) {
          console.error('[Report] Error inserting usage_log:', logError);
          return; // 실패해도 계속
        }

        // 4b. Redis에 비용 증액
        await incrementSpent(apiKeyRecord.project_id, body.cost_usd);

        // 4c. budgets 테이블 업데이트 또는 생성
        const periodStart = getMonthPeriodStart(1);
        const periodStartStr = periodStart.toISOString().split('T')[0];

        const { data: existingBudget, error: budgetQueryError } = await supabase
          .from('budgets')
          .select('id')
          .eq('project_id', apiKeyRecord.project_id)
          .eq('period_start', periodStartStr)
          .single();

        if (budgetQueryError && budgetQueryError.code !== 'PGRST116') {
          // PGRST116 = 행 없음 (정상)
          console.error('[Report] Error querying budget:', budgetQueryError);
          return;
        }

        if (existingBudget?.id) {
          // 업데이트
          const { error: updateError } = await supabase
            .from('budgets')
            .update({
              spent_usd: (await supabase.rpc('get_current_spend', { p_project_id: apiKeyRecord.project_id })).data,
              call_count: body.is_blocked ? 0 : 1, // 증가시키는 로직은 trigger로 처리
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingBudget.id);

          if (updateError) {
            console.error('[Report] Error updating budget:', updateError);
          }
        } else {
          // 생성
          const { error: insertError } = await supabase
            .from('budgets')
            .insert({
              project_id: apiKeyRecord.project_id,
              user_id: apiKeyRecord.user_id,
              period_start: periodStartStr,
              spent_usd: body.cost_usd,
              call_count: body.is_blocked ? 0 : 1,
              blocked_count: body.is_blocked ? 1 : 0,
              updated_at: new Date().toISOString(),
            });

          if (insertError && insertError.code !== 'PGRST100') {
            // PGRST100 = 중복 (동시성 문제, 무시)
            console.error('[Report] Error inserting budget:', insertError);
          }
        }
      } catch (bgError) {
        console.error('[Report] Background task error:', bgError);
        // 에러 로깅만 하고 계속
      }
    })();

    return response;
  } catch (error) {
    console.error('[SDK Report Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          requestId,
        },
      },
      { status: 500 }
    );
  }
}
