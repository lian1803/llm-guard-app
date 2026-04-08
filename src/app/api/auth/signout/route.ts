import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRequestId } from '@/lib/utils';

// POST /api/auth/signout — 로그아웃
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: error.message,
            requestId,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { message: 'Signed out successfully' } }, { status: 200 });
  } catch (error) {
    console.error('[Signout Error]', error);
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
