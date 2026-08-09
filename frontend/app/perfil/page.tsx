import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "../components";
import { MarketIcon } from "../icons";
import { AddressManager, type Address } from "../address-manager";

async function getCurrentUser() {
  const apiUrl = process.env.API_URL ?? "http://127.0.0.1:3000";
  const token = (await cookies()).get("emarket-session")?.value;
  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/login");
  }

  const data = (await response.json()) as {
    user: { name: string; email: string; phone?: string | null };
  };
  const addressResponse = await fetch(`${apiUrl}/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  const addresses = addressResponse.ok
    ? ((await addressResponse.json()) as Address[])
    : [];

  return { user: data.user, addresses };
}

export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
}) {
  const { user, addresses } = await getCurrentUser();
  const { erro, sucesso } = await searchParams;

  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Minha conta</span>
          <h1>Minha conta</h1>
          <p>Gerencie seus dados pessoais e preferências.</p>
        </header>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-title">
              <div>
                <h2>Dados pessoais</h2>
                <p>
                  Seus dados serão atualizados no banco de dados do sistema.
                </p>
              </div>
              <span className="account-chip">Conta ativa</span>
            </div>
            <form
              className="form-grid account-form"
              action="/api/profile"
              method="post"
            >
              {erro && (
                <p className="form-message error" role="alert">
                  {erro}
                </p>
              )}
              {sucesso && (
                <p className="form-message success" role="status">
                  Dados atualizados com sucesso.
                </p>
              )}
              <div className="field">
                <label>Nome</label>
                <input name="name" defaultValue={user.name} />
              </div>
              <div className="field">
                <label>E-mail</label>
                <input name="email" type="email" defaultValue={user.email} />
              </div>
              <div className="field">
                <label>Telefone</label>
                <input
                  name="phone"
                  placeholder="(00) 00000-0000"
                  defaultValue={user.phone ?? ""}
                />
              </div>
              <button className="primary full" type="submit">
                Salvar alterações
              </button>
            </form>
          </section>

          <aside className="panel account-shortcuts">
            <h2>Atalhos</h2>
            <Link className="account-shortcut" href="/pedidos">
              <MarketIcon name="package" />
              <span>
                <b>Pedidos</b>
                <small>Acompanhe suas compras</small>
              </span>
              <MarketIcon name="arrow" />
            </Link>
            <Link className="account-shortcut" href="/favoritos">
              <MarketIcon name="heart" />
              <span>
                <b>Favoritos</b>
                <small>Consulte os produtos salvos</small>
              </span>
              <MarketIcon name="arrow" />
            </Link>
            <p className="account-note">
              Use seu CPF ou e-mail para acessar esta conta.
            </p>
          </aside>
        </div>
        <AddressManager initialAddresses={addresses} />
      </main>
    </Shell>
  );
}
