import { Redis } from '@upstash/redis';

// Upstash Redis 클라이언트 (싱글톤)
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) {
    return redis;
  }

  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return redis;
}

/**
 * 현재 월의 누적 비용 조회
 * @param projectId - 프로젝트 ID
 * @returns 누적 비용 (USD)
 */
export async function getCurrentMonthSpent(projectId: string): Promise<number> {
  const redisClient = getRedis();
  const key = `budget:${projectId}:current`;

  try {
    const spent = await redisClient.get<number>(key);
    return spent ?? 0;
  } catch (error) {
    console.error('[Upstash] Error getting current spend:', error);
    // Redis 오류 시 0 반환 (DB 쿼리는 fallback에서 처리)
    return 0;
  }
}

/**
 * 비용 증액
 * @param projectId - 프로젝트 ID
 * @param amount - 추가할 비용 (USD)
 */
export async function incrementSpent(projectId: string, amount: number): Promise<void> {
  const redisClient = getRedis();
  const key = `budget:${projectId}:current`;

  try {
    await redisClient.incrbyfloat(key, amount);

    // 월 초 설정된 경우 24시간 TTL 설정 (월 전환 시 자동 삭제)
    // 실제로는 매월 1일에 크론으로 리셋
    const ttl = 30 * 24 * 60 * 60; // 30일 TTL
    await redisClient.expire(key, ttl);
  } catch (error) {
    console.error('[Upstash] Error incrementing spend:', error);
    // Redis 오류는 무시하고 진행 (DB write 이후 일관성 있음)
  }
}

/**
 * 월별 누적 비용 리셋
 * @param projectId - 프로젝트 ID
 */
export async function resetMonthlyBudget(projectId: string): Promise<void> {
  const redisClient = getRedis();
  const key = `budget:${projectId}:current`;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('[Upstash] Error resetting budget:', error);
  }
}

/**
 * 루프 감지용 카운터 증가
 * @param projectId - 프로젝트 ID
 * @param requestHash - 요청 해시
 */
export async function incrementLoopCounter(projectId: string, requestHash: string): Promise<number> {
  const redisClient = getRedis();
  const key = `loop:${projectId}:${requestHash}`;

  try {
    const count = await redisClient.incr(key);
    // 5분 TTL 설정 (윈도우)
    await redisClient.expire(key, 5 * 60);
    return count;
  } catch (error) {
    console.error('[Upstash] Error incrementing loop counter:', error);
    return 0;
  }
}

/**
 * 루프 카운터 조회
 * @param projectId - 프로젝트 ID
 * @param requestHash - 요청 해시
 */
export async function getLoopCounter(projectId: string, requestHash: string): Promise<number> {
  const redisClient = getRedis();
  const key = `loop:${projectId}:${requestHash}`;

  try {
    const count = await redisClient.get<number>(key);
    return count ?? 0;
  } catch (error) {
    console.error('[Upstash] Error getting loop counter:', error);
    return 0;
  }
}
