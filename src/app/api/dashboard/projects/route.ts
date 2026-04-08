import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRequestId } from '@/lib/utils';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  budget_usd: z.number().positive().default(10.0),
  reset_day: z.number().min(1).max(28).default(1),
});

// GET /api/dashboard/projects — 내 프로젝트 목록
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const supabase = await createClient();

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

    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, description, budget_usd, reset_day, is_active, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch projects',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: projects }, { status: 200 });
  } catch (error) {
    console.error('[Projects GET Error]', error);
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

// POST /api/dashboard/projects — 프로젝트 생성
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = createProjectSchema.parse(await request.json());
    const supabase = await createClient();

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

    // 프로젝트 생성
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description,
        budget_usd: body.budget_usd,
        reset_day: body.reset_day,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create project',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // 초기 budget 레코드 생성
    const periodStart = new Date();
    periodStart.setDate(body.reset_day);
    if (periodStart < new Date()) {
      periodStart.setMonth(periodStart.getMonth() + 1);
    }

    await supabase
      .from('budgets')
      .insert({
        project_id: project.id,
        user_id: user.id,
        period_start: periodStart.toISOString().split('T')[0],
        spent_usd: 0,
        call_count: 0,
        blocked_count: 0,
      })
      .catch(() => {}); // 무시

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('[Projects POST Error]', error);
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
