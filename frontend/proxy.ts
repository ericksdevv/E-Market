import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3000';
const publicRoutes = ['/', '/login', '/cadastro', '/recuperar-senha', '/_next', '/images', '/favicon.ico'];

function isPublic(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('emarket-session');
  return response;
}

export async function proxy(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();

  const token = request.cookies.get('emarket-session')?.value;
  if (!token) return redirectToLogin(request);

  try {
    const session = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!session.ok) return redirectToLogin(request);
    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = { matcher: ['/((?!api).*)'] };
