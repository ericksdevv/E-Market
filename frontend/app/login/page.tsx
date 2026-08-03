import { cookies } from 'next/headers';
import Link from 'next/link';
import { AuthFooter, AuthFrame } from '../auth-frame';

function getSessionName(token?: string) {
  if (!token) return undefined;
  try { return (JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { name?: string }).name; }
  catch { return undefined; }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  const { erro, sucesso } = await searchParams;
  const cookieStore = await cookies();
  const rememberedEmail = cookieStore.get('emarket-remembered-email')?.value;
  const userName = getSessionName(cookieStore.get('emarket-session')?.value);
  if (sucesso) return <AuthFrame mode="login" userName={userName}><meta httpEquiv="refresh" content="2;url=/mercado"/><div className="auth-success"><span className="auth-success-check">✓</span><p>Login efetuado com sucesso</p><small>Preparando seu mercado...</small></div></AuthFrame>;
  return <AuthFrame mode="login" userName={userName}>
    <h1>Faça seu login</h1><p className="auth-subtitle">Acesse sua conta para continuar</p>
    <form className="auth-form" action="/api/session" method="post"><input type="hidden" name="mode" value="login"/>
      <label>E-mail ou CPF<input name="identifier" type="text" placeholder="seu@email.com ou CPF" defaultValue={rememberedEmail} required/></label>
      <div className="auth-label-row"><label>Senha</label><Link href="/recuperar-senha">Esqueceu a senha?</Link></div>
      <input name="password" type="password" placeholder="••••••••" minLength={8} required/>
      <label className="auth-remember"><input name="remember" type="checkbox" defaultChecked={Boolean(rememberedEmail)}/><span>Lembrar minha conta neste dispositivo</span></label>
      {erro && <p className="auth-error" role="alert">{erro}</p>}
      <button className="auth-submit" type="submit">Entrar</button>
    </form>
    <p className="social-note">Login social poderá ser ativado quando as credenciais OAuth do projeto forem configuradas.</p>
    <AuthFooter mode="login"/>
  </AuthFrame>;
}
