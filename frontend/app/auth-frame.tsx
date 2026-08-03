import Image from "next/image";
import Link from "next/link";
import { MarketIcon } from "./icons";

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
          <span className="auth-showcase-kicker">
            <MarketIcon name="basket" /> Compras online
          </span>
          <h1>
            Bem-vindo ao
            <br />
            E-Market.
          </h1>
          <p>
            Produtos para o dia a dia, pedidos acompanhados e entrega no
            endereço cadastrado.
          </p>
          <div className="auth-benefits">
            <span>
              <i>
                <MarketIcon name="truck" />
              </i>
              <b>Entrega</b>
              <small>Acompanhamento do pedido</small>
            </span>
            <span>
              <i>
                <MarketIcon name="shield" />
              </i>
              <b>Conta protegida</b>
              <small>Acesso autenticado</small>
            </span>
            <span>
              <i>
                <MarketIcon name="tag" />
              </i>
              <b>Ofertas</b>
              <small>Preços identificados</small>
            </span>
          </div>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">
          <span className="auth-card-badge">
            <MarketIcon name="shield" /> Acesso protegido
          </span>
          <p className="auth-welcome">
            {mode === "login"
              ? userName
                ? `Bem-vindo de volta, ${userName}!`
                : "Bem-vindo de volta!"
              : "Crie sua conta"}
          </p>
          {children}
        </div>
        <div className="auth-trust">
          <span>
            <MarketIcon name="shield" />
            <small>Ambiente seguro</small>
          </span>
          <span>
            <MarketIcon name="truck" />
            <small>Entrega acompanhada</small>
          </span>
          <span>
            <MarketIcon name="heart" />
            <small>Favoritos salvos</small>
          </span>
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
