/**
 * Next.js Middleware — JWT 검증
 * /dashboard 및 특정 API 경로 보호
 */

import { type NextRequest, NextResponse } from 'next/server';
import { verifyJWT, extractJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 대시보드 경로 보호
  if (pathname.startsWith('/dashboard')) {
    const token =
      extractJWT(request.headers.get('authorization')) ||
      request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 요청에 사용자 정보 추가 (헤더로)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // API 경로 보호 (관리자 전용)
  if (pathname.startsWith('/api/dashboard')) {
    // Authorization 헤더 OR HttpOnly 쿠키 (raw Cookie 헤더에서 파싱)
    let token = extractJWT(request.headers.get('authorization'));
    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      for (const part of cookieHeader.split(';')) {
        const [name, ...rest] = part.trim().split('=');
        if (name.trim() === 'auth_token') {
          token = rest.join('=') || null;
          break;
        }
      }
    }
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
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/v1/sdk (public SDK endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/v1/sdk|_next/static|_next/image|favicon.ico).*)',
  ],
};
