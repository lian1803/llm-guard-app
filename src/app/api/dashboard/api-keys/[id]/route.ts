import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRequestId } from '@/lib/utils';

// DELETE /api/dashboard/api-keys/[id] — API 키 비활성화
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // 소유권 확인 후 비활성화
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to delete API key',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (error) {
    console.error('[API Key DELETE Error]', error);
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
