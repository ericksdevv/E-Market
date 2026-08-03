'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { Shell } from '../components';
import { money } from '../store-data';

const labels: Record<string, string> = { AWAITING_PAYMENT: 'Aguardando pagamento', PAID: 'Pago', PREPARING: 'Em separação', OUT_FOR_DELIVERY: 'Saiu para entrega', DELIVERED: 'Entregue', CANCELED: 'Cancelado' };
export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => api<any[]>('/orders').then(setOrders).finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);
  const cancel = async (id: number) => { if (!window.confirm('Deseja cancelar este pedido?')) return; await api(`/orders/${id}/cancel`, { method: 'PATCH' }); await load(); };
  return <Shell><main className="container"><header className="page-head"><span className="crumb">Início / Meus pedidos</span><h1>Meus pedidos</h1><p>Acompanhe suas compras e consulte o histórico.</p></header>
    <section className="orders-list">{loading ? <div className="panel">Carregando pedidos...</div> : orders.length ? orders.map((order) => <article className="panel order-card" key={order.id}><div className="order-card-head"><div><span className="eyebrow">Pedido #{String(order.id).padStart(6, '0')}</span><h2>{labels[order.status] ?? order.status}</h2><p>{new Date(order.createdAt).toLocaleString('pt-BR')} · {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</p></div><strong>{money(Number(order.total))}</strong></div><div className="order-items">{order.items.map((item: any) => <span key={item.id}>{item.quantity}× {item.name}</span>)}</div><div className="order-actions"><span>Pagamento: {order.payment?.method?.replaceAll('_', ' ')}</span>{['AWAITING_PAYMENT','PAID'].includes(order.status) && <button className="danger-link" onClick={() => cancel(order.id)}>Cancelar pedido</button>}</div></article>) : <div className="panel empty-state"><div>📦</div><h2>Você ainda não fez pedidos</h2><p>Escolha seus produtos e finalize sua primeira compra.</p><Link className="primary" href="/categorias">Começar a comprar</Link></div>}</section>
  </main></Shell>;
}
