import { NextRequest, NextResponse } from 'next/server';
const publicRoutes = ['/', '/login', '/cadastro', '/recuperar-senha', '/_next', '/images', '/favicon.ico'];
export function proxy(request: NextRequest) { if (publicRoutes.some((route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`))) return NextResponse.next(); if (!request.cookies.get('emarket-session')?.value) return NextResponse.redirect(new URL('/login', request.url)); return NextResponse.next(); }
export const config = { matcher: ['/((?!api).*)'] };
