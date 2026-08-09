import { cookies } from "next/headers";
import Link from "next/link";
import { AuthFooter, AuthFrame } from "../auth-frame";
import { MarketIcon } from "../icons";
import { AuthSuccess } from "../auth-success";

async function getSessionName() {
  const token = (await cookies()).get("emarket-session")?.value;
  if (!token) return undefined;
  try {
    const apiUrl = process.env.API_URL ?? "http://127.0.0.1:3000";
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return undefined;
    const data = (await response.json()) as { user?: { name?: string } };
    return data.user?.name;
  } catch {
    return undefined;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
}) {
  const { erro, sucesso } = await searchParams;
  const userName = sucesso ? await getSessionName() : undefined;
  if (sucesso)
    return (
      <AuthFrame mode="login" userName={userName}>
        <AuthSuccess
          title="Login efetuado com sucesso"
          description="Preparando seu mercado..."
        />
      </AuthFrame>
    );
  return (
    <AuthFrame mode="login" userName={userName}>
      <h1>Entre na sua conta</h1>
      <p className="auth-subtitle">Use seu e-mail ou CPF para continuar</p>
      <form className="auth-form" action="/api/session" method="post">
        <input type="hidden" name="mode" value="login" />
        <label>
          E-mail ou CPF
          <div className="auth-input-shell">
            <MarketIcon name="user" />
            <input
              name="identifier"
              type="text"
              autoComplete="username"
              aria-label="E-mail ou CPF"
              required
            />
          </div>
        </label>
        <div className="auth-label-row">
          <label>Senha</label>
          <Link href="/recuperar-senha">Esqueceu a senha?</Link>
        </div>
        <div className="auth-input-shell">
          <MarketIcon name="lock" />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            aria-label="Senha"
            minLength={8}
            maxLength={64}
            required
          />
        </div>
        {erro && (
          <p className="auth-error" role="alert">
            {erro}
          </p>
        )}
        <button className="auth-submit" type="submit">
          <span>Entrar na minha conta</span>
          <MarketIcon name="arrow" />
        </button>
      </form>
      <AuthFooter mode="login" />
    </AuthFrame>
  );
}
