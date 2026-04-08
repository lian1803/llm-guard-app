import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRequestId } from '@/lib/utils';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// POST /api/auth/signup — 회원가입
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = signupSchema.parse(await request.json());
    const supabase = await createClient();

    // Supabase Auth로 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    });

    if (authError) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: authError.message,
            requestId,
          },
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: 'Failed to create user',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // users 테이블에 레코드 생성
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: body.email,
        plan: 'free',
      });

    if (profileError) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create user profile',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // 초기 프로젝트 생성
    const { error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: authData.user.id,
        name: 'Default Project',
        budget_usd: 10.0,
        reset_day: 1,
        is_active: true,
      });

    if (projectError) {
      console.error('[Signup] Error creating default project:', projectError);
      // 에러 무시, 계속 진행
    }

    return NextResponse.json(
      {
        data: {
          user_id: authData.user.id,
          email: body.email,
          message: 'Signup successful. Please check your email to verify your account.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Signup Error]', error);
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
