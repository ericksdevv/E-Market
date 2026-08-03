import { cookies } from "next/headers";
import Link from "next/link";
import { AuthFooter, AuthFrame } from "../auth-frame";
import { MarketIcon } from "../icons";

function getSessionName(token?: string) {
  if (!token) return undefined;
  try {
    return (
      JSON.parse(
        Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
      ) as { name?: string }
    ).name;
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
  const userName = getSessionName(
    (await cookies()).get("emarket-session")?.value,
  );
  if (sucesso)
    return (
      <AuthFrame mode="login" userName={userName}>
        <meta httpEquiv="refresh" content="2;url=/mercado" />
        <div className="auth-success">
          <span className="auth-success-check">
            <MarketIcon name="check" />
          </span>
          <p>Login efetuado com sucesso</p>
          <small>Preparando seu mercado...</small>
        </div>
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
