import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3000';

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const token = (await cookies()).get('emarket-session')?.value;
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
  try {
    const response = await fetch(`${API_URL}/${path.join('/')}${request.nextUrl.search}`, {
      method: request.method,
      headers: { 'Content-Type': request.headers.get('content-type') ?? 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body || undefined,
      cache: 'no-store',
    });
    return new NextResponse(await response.text(), { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' } });
  } catch {
    return NextResponse.json({ message: 'A API do E-Market está indisponível' }, { status: 503 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
