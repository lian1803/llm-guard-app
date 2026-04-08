import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * API Key 생성 (lg_ 접두어 포함)
 */
export function generateApiKey(): { key: string; prefix: string } {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const key = `lg_${randomBytes}`;
  // 앞 8자만 노출 (lg_ + 8자)
  const prefix = key.substring(0, 13); // lg_ + 8자

  return { key, prefix };
}

/**
 * API Key 해싱 (bcrypt)
 */
export async function hashApiKey(key: string): Promise<string> {
  return bcrypt.hash(key, 10);
}

/**
 * API Key 검증 (상수 시간 비교)
 */
export async function verifyApiKey(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * 요청 메시지 해시 (루프 감지용)
 */
export function computeMessageHash(messages: any[]): string {
  const content = JSON.stringify(messages);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 요청 ID 생성 (추적용)
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * 현재 월의 시작일 계산 (reset_day 기준)
 */
export function getMonthPeriodStart(resetDay: number = 1, now: Date = new Date()): Date {
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentDay = now.getDate();

  if (currentDay >= resetDay) {
    // 현재 월이 reset_day를 지났음
    return new Date(year, month, resetDay);
  } else {
    // 지난 달 reset_day부터 시작
    return new Date(year, month - 1, resetDay);
  }
}

/**
 * 다음 월의 시작일 계산
 */
export function getNextMonthPeriodStart(resetDay: number = 1, now: Date = new Date()): Date {
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentDay = now.getDate();

  if (currentDay >= resetDay) {
    // 다음 달의 reset_day
    return new Date(year, month + 1, resetDay);
  } else {
    // 현재 달의 reset_day
    return new Date(year, month, resetDay);
  }
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(
  code: string,
  message: string,
  requestId: string,
  status: number = 400
): { error: any; status: number } {
  return {
    error: {
      code,
      message,
      requestId,
    },
    status,
  };
}

/**
 * HMAC-SHA256 기반 타이밍 어택 방지 비교
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * ISO 날짜 문자열 반환 (UTC)
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * 지정한 일수를 더한 미래 날짜 반환
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
