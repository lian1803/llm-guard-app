/**
 * Next.js 16+ Proxy (구 middleware.ts) — JWT 검증
 * /dashboard 및 /api/dashboard 경로 보호
 */

export const runtime = 'edge';

import { type NextRequest, NextResponse } from 'next/server';
import { verifyJWT, extractJWT } from '@/lib/auth';

function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Authorization 헤더 (API 클라이언트)
  const fromHeader = extractJWT(request.headers.get('authorization'));
  if (fromHeader) return fromHeader;

  // 2. HttpOnly 쿠키 (브라우저) — raw Cookie 헤더에서 파싱
  const cookieHeader = request.headers.get('cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name.trim() === 'auth_token') {
      return rest.join('=') || null;
    }
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 대시보드 페이지 보호 — 미인증 시 로그인으로 리다이렉트
  if (pathname.startsWith('/dashboard')) {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // API 대시보드 경로 보호 — 미인증 시 401
  if (pathname.startsWith('/api/dashboard')) {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    '/((?!api/v1/sdk|_next/static|_next/image|favicon.ico).*)',
  ],
};
