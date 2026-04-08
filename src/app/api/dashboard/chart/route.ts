import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRequestId } from '@/lib/utils';

// GET /api/dashboard/chart — 7일 일별 비용 데이터
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!projectId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_PARAM',
            message: 'Missing project_id parameter',
            requestId,
          },
        },
        { status: 400 }
      );
    }

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

    // 프로젝트 소유권 확인
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
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

    // N일 전부터 오늘까지 일별 비용 조회
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: logs, error: logsError } = await supabase
      .from('usage_logs')
      .select('called_at, cost_usd')
      .eq('project_id', projectId)
      .gte('called_at', startDateStr);

    if (logsError) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch usage logs',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // 일별 합계 계산
    const dailyData: { [date: string]: number } = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }

    logs?.forEach((log) => {
      const dateStr = log.called_at.split('T')[0];
      if (dailyData[dateStr] !== undefined) {
        dailyData[dateStr] += parseFloat(log.cost_usd.toString());
      }
    });

    // 날짜순 정렬
    const chartData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost]) => ({
        date,
        cost: parseFloat(cost.toFixed(4)),
      }));

    return NextResponse.json({ data: chartData }, { status: 200 });
  } catch (error) {
    console.error('[Chart GET Error]', error);
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
