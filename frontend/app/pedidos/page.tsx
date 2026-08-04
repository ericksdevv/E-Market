"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiOrder } from "../api";
import { Shell } from "../components";
import { MarketIcon } from "../icons";
import { money } from "../store-data";

const labels: Record<string, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  PREPARING: "Em separação",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    setError("");
    return api<ApiOrder[]>("/orders")
      .then(setOrders)
      .catch((value: Error) => setError(value.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api<ApiOrder[]>("/orders")
      .then(setOrders)
      .catch((value: Error) => setError(value.message))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id: number) => {
    if (!window.confirm("Deseja cancelar este pedido?")) return;
    try {
      await api(`/orders/${id}/cancel`, { method: "PATCH" });
      await load();
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Não foi possível cancelar o pedido",
      );
    }
  };

  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Meus pedidos</span>
          <h1>Meus pedidos</h1>
          <p>Acompanhe suas compras e consulte o histórico.</p>
        </header>
        <section className="orders-list">
          {loading ? (
            <div className="catalog-skeleton" aria-label="Carregando pedidos" />
          ) : error ? (
            <div className="panel empty-state">
              <h2>Não foi possível carregar seus pedidos</h2>
              <p>{error}</p>
              <button className="secondary" onClick={() => void load()}>
                Tentar novamente
              </button>
            </div>
          ) : orders.length ? (
            orders.map((order) => (
              <article className="panel order-card" key={order.id}>
                <div className="order-card-head">
                  <div>
                    <span className="eyebrow">
                      Pedido #{String(order.id).padStart(6, "0")}
                    </span>
                    <h2>{labels[order.status] ?? order.status}</h2>
                    <p>
                      {new Date(order.createdAt).toLocaleString("pt-BR")} ·{" "}
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <strong>{money(Number(order.total))}</strong>
                </div>
                <div className="order-items">
                  {order.items.map((item) => (
                    <span key={item.id}>
                      {item.quantity}× {item.name}
                    </span>
                  ))}
                </div>
                <div className="order-actions">
                  <span>
                    Pagamento: {order.payment?.method?.replaceAll("_", " ")}
                  </span>
                  {["AWAITING_PAYMENT", "PAID"].includes(order.status) && (
                    <button
                      className="danger-link"
                      onClick={() => cancel(order.id)}
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="panel empty-state">
              <MarketIcon name="basket" />
              <h2>Nenhum pedido encontrado</h2>
              <p>Seus pedidos aparecerão aqui após a confirmação.</p>
              <Link className="primary" href="/categorias/hortifruti">
                Ver produtos
              </Link>
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}
