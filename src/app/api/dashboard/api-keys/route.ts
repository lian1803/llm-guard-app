import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateApiKey, hashApiKey, generateRequestId } from '@/lib/utils';
import { z } from 'zod';

const createKeySchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(100),
});

// GET /api/dashboard/api-keys — 내 API 키 목록 조회
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
            requestId,
          },
        },
        { status: 401 }
      );
    }

    // 내 API 키 조회
    const { data: apiKeys, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, project_id, name, key_prefix, last_used_at, is_active, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch API keys',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: apiKeys }, { status: 200 });
  } catch (error) {
    console.error('[API Keys GET Error]', error);
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

// POST /api/dashboard/api-keys — 신규 API 키 발급
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = createKeySchema.parse(await request.json());
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
            requestId,
          },
        },
        { status: 401 }
      );
    }

    // 프로젝트 소유권 확인
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', body.project_id)
      .eq('user_id', user.id)
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

    // 새 API 키 생성
    const { key, prefix } = generateApiKey();
    const keyHash = await hashApiKey(key);

    // DB 저장
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        project_id: body.project_id,
        name: body.name,
        key_hash: keyHash,
        key_prefix: prefix,
        is_active: true,
      });

    if (insertError) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create API key',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // 응답: 원본 키는 1회만 노출
    return NextResponse.json(
      {
        data: {
          key, // 원본 (1회만)
          prefix,
          message: 'Save this key securely. You will not be able to see it again.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Keys POST Error]', error);
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
