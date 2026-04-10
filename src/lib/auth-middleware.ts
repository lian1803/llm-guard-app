/**
 * JWT 기반 인증 미들웨어 (Edge Runtime 호환)
 */

import { NextRequest } from 'next/server';
import { verifyJWT, JWTPayload } from './auth';

export async function verifyAuth(request: NextRequest): Promise<{ userId: string; payload: JWTPayload } | null> {
  try {
    // 1. Authorization 헤더 (API 클라이언트)
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader) {
      token = authHeader.split(' ')[1] || null;
    }

    // 2. HttpOnly 쿠키 (브라우저)
    if (!token) {
      token = request.cookies.get('auth_token')?.value || null;
    }

    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;

    return { userId: payload.sub, payload };
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return null;
  }
}
