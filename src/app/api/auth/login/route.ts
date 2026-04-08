import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRequestId } from '@/lib/utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});

// POST /api/auth/login — 로그인
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = loginSchema.parse(await request.json());
    const supabase = await createClient();

    // Supabase Auth로 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: 'Login failed',
            requestId,
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        data: {
          user_id: authData.user.id,
          email: authData.user.email,
          message: 'Login successful',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Login Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          requestId: generateRequestId(),
        },
      },
      { status: 500 }
    );
  }
}
