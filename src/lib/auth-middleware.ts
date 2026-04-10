/**
 * JWT 기반 인증 미들웨어 (Edge Runtime 호환)
 */

import { NextRequest } from 'next/server';
import { verifyJWT, JWTPayload } from './auth';

export async function verifyAuth(request: NextRequest): Promise<{ userId: string; payload: JWTPayload } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1]; // "Bearer <token>"
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;

    return { userId: payload.sub, payload };
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return null;
  }
}
