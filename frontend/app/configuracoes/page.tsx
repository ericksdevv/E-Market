"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiUserSettings } from "../api";
import { Shell, useStore } from "../components";

export default function SettingsPage() {
  const { dark, setDark } = useStore();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<ApiUserSettings>("/auth/me")
      .then((data) => {
        setOrderUpdates(data.user.orderUpdates);
        setMarketingEmails(data.user.marketingEmails);
      })
      .catch(() => undefined);
  }, []);

  const save = async (
    updates: Record<string, boolean | string>,
    rollback?: () => void,
  ) => {
    setError("");
    try {
      await api("/auth/settings", {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (value) {
      rollback?.();
      setError(value instanceof Error ? value.message : "Não foi possível salvar");
    }
  };

  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Configurações</span>
          <h1>Configurações</h1>
          <p>Defina a aparência e as notificações da conta.</p>
        </header>
        <div className="settings-layout">
          <aside className="settings-menu panel">
            <Link className="active" href="/configuracoes">
              Preferências
            </Link>
            <Link href="/perfil">Dados da conta</Link>
            <Link href="/pedidos">Pedidos</Link>
            <Link href="/favoritos">Favoritos</Link>
          </aside>
          <section className="panel settings-panel">
            <div className="panel-title">
              <div>
                <h2>Aparência</h2>
                <p>O tema é aplicado em todas as telas do mercado.</p>
              </div>
            </div>
            <label className="setting-row">
              <span>
                <b>Tema escuro</b>
                <small>Reduz o brilho e usa cores escuras.</small>
              </span>
              <input
                className="switch"
                type="checkbox"
                checked={dark}
                onChange={(event) => {
                  setDark(event.target.checked);
                  setSaved(true);
                  window.setTimeout(() => setSaved(false), 2000);
                }}
              />
            </label>
            <div className="panel-title settings-section">
              <div>
                <h2>Notificações</h2>
                <p>Escolha como deseja receber novidades.</p>
              </div>
            </div>
            <label className="setting-row">
              <span>
                <b>Atualizações dos pedidos</b>
                <small>Avisos de pagamento, separação e entrega.</small>
              </span>
              <input
                className="switch"
                type="checkbox"
                checked={orderUpdates}
                onChange={(event) => {
                  setOrderUpdates(event.target.checked);
                  void save(
                    { orderUpdates: event.target.checked },
                    () => setOrderUpdates(!event.target.checked),
                  );
                }}
              />
            </label>
            <label className="setting-row">
              <span>
                <b>Ofertas por e-mail</b>
                <small>Promoções relevantes, sem excesso de mensagens.</small>
              </span>
              <input
                className="switch"
                type="checkbox"
                checked={marketingEmails}
                onChange={(event) => {
                  setMarketingEmails(event.target.checked);
                  void save(
                    { marketingEmails: event.target.checked },
                    () => setMarketingEmails(!event.target.checked),
                  );
                }}
              />
            </label>
            {saved && <p className="save-feedback">✓ Preferências salvas</p>}
            {error && <p className="form-error">{error}</p>}
            <div className="danger-zone">
              <div>
                <b>Sair deste dispositivo</b>
                <small>
                  Será necessário entrar novamente para acessar o mercado.
                </small>
              </div>
              <form action="/api/logout" method="post">
                <button className="secondary">Sair da conta</button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </Shell>
  );
}
