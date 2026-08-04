import Image from "next/image";
import Link from "next/link";

export function AuthFrame({
  children,
  mode,
  userName,
}: {
  children: React.ReactNode;
  mode: "login" | "register";
  userName?: string;
}) {
  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Image
          className="auth-showcase-image"
          src="/images/login-market-hero.png"
          alt="Cesta com produtos em um mercado"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 46vw"
        />
        <div className="auth-showcase-overlay" />
        <Link className="auth-logo" href="/login" aria-label="E-Market">
          <span className="auth-logo-mark">e</span>
          <span>E-Market</span>
        </Link>
        <div className="auth-showcase-copy">
          <h1>
            Bem-vindo ao
            <br />
            E-Market.
          </h1>
          <p>Seu mercado no conforto da sua casa, do pedido à entrega.</p>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">
          <p className="auth-welcome">
            {mode === "login"
              ? userName
                ? `Bem-vindo de volta, ${userName}!`
                : "Bem-vindo de volta!"
              : "Crie sua conta"}
          </p>
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthFooter({ mode }: { mode: "login" | "register" }) {
  return (
    <p className="auth-switch">
      {mode === "login" ? (
        <>
          Ainda não tem uma conta? <Link href="/cadastro">Cadastre-se</Link>
        </>
      ) : (
        <>
          Já possui uma conta? <Link href="/login">Entrar</Link>
        </>
      )}
    </p>
  );
}
