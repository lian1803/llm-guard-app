import { NextRequest, NextResponse } from 'next/function';
import { generateRequestId } from '@/lib/utils';
import { z } from 'zod';

const testSchema = z.object({
  slack_webhook: z.string().url(),
});

// POST /api/webhooks/slack-test — Slack 웹훅 테스트
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = testSchema.parse(await request.json());

    // Slack 메시지 전송
    const response = await fetch(body.slack_webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '🔔 LLM Guard Test Notification',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*LLM Guard - Test Alert*\n\nThis is a test notification from LLM Guard. Your Slack integration is working correctly!',
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: {
            code: 'SLACK_ERROR',
            message: 'Failed to send Slack message',
            requestId,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data: { message: 'Test notification sent successfully' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Slack Test Error]', error);
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
