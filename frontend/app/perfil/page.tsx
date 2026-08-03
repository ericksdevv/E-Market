import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Shell } from '../components';

async function getCurrentUser() {
  const token = (await cookies()).get('emarket-session')?.value;
  if (!token) {
    redirect('/login');
  }

  const response = await fetch('http://127.0.0.1:3000/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect('/login');
  }

  const data = (await response.json()) as {
    user: { name: string; email: string; phone?: string | null };
  };

  return data.user;
}

export default async function Profile() {
  const user = await getCurrentUser();

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
                <p>Seus dados serão atualizados no banco de dados do sistema.</p>
              </div>
              <span className="account-chip">Conta ativa</span>
            </div>
            <form className="form-grid account-form" action="/api/profile" method="post">
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
                  defaultValue={user.phone ?? ''}
                />
              </div>
              <button className="primary full" type="submit">
                Salvar alterações
              </button>
            </form>
          </section>

          <aside className="panel">
            <h2 style={{ marginTop: 0 }}>Atalhos</h2>
            <Link
              className="text-link"
              style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid #e8ece7' }}
              href="/pedidos"
            >
              📦 Meus pedidos
            </Link>
            <Link
              className="text-link"
              style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid #e8ece7' }}
              href="/favoritos"
            >
              ♡ Meus favoritos
            </Link>
            <p style={{ margin: '18px 0 0', color: '#647066', fontSize: 13 }}>
              Entre com seu CPF ou e-mail em futuras visitas, e seus dados continuam salvos aqui.
            </p>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
