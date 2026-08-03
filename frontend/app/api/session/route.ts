import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3000';
const digits = (value: FormDataEntryValue | null) => String(value ?? '').replace(/\D/g, '');

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const mode = form.get('mode') === 'register' ? 'register' : 'login';
  const identifier = String(form.get('identifier') ?? '').trim();
  const payload = mode === 'register'
    ? {
        name: String(form.get('name') ?? '').trim(), email: String(form.get('email') ?? '').trim(),
        cpf: digits(form.get('cpf')), street: String(form.get('street') ?? '').trim(),
        number: String(form.get('number') ?? '').trim(), neighborhood: String(form.get('neighborhood') ?? '').trim(),
        city: String(form.get('city') ?? '').trim(), state: String(form.get('state') ?? '').trim(),
        zipCode: digits(form.get('zipCode')), password: String(form.get('password') ?? ''),
      }
    : {
        ...(identifier.includes('@') ? { email: identifier } : { cpf: digits(identifier) }),
        password: String(form.get('password') ?? ''),
      };
  const response = await fetch(`${API_URL}/auth/${mode}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message[0] : body.message ?? 'Não foi possível concluir a solicitação';
    return new NextResponse(null, { status: 303, headers: { Location: `/${mode === 'register' ? 'cadastro' : 'login'}?erro=${encodeURIComponent(message)}` } });
  }
  const data = await response.json() as { access_token: string };
  const destination = mode === 'register' ? '/cadastro?sucesso=1' : '/login?sucesso=1';
  const result = new NextResponse(null, { status: 303, headers: { Location: destination } });
  result.cookies.set('emarket-session', data.access_token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 });
  if (mode === 'login' && form.get('remember') === 'on' && identifier.includes('@')) {
    result.cookies.set('emarket-remembered-email', identifier, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  } else {
    result.cookies.delete('emarket-remembered-email');
  }
  return result;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url), 303);
  response.cookies.delete('emarket-session');
  return response;
}
