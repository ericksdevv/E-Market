"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiOrder } from "../api";
import { Shell, useStore } from "../components";
import { MarketIcon, type MarketIconName } from "../icons";
import { money } from "../store-data";

type Address = {
  id: number;
  label?: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

const paymentOptions: Array<{
  value: string;
  title: string;
  description: string;
  icon: MarketIconName;
}> = [
  {
    value: "PIX",
    title: "PIX",
    description: "Confirmação imediata",
    icon: "pix",
  },
  {
    value: "CREDIT_CARD",
    title: "Cartão de crédito",
    description: "Pagamento protegido",
    icon: "card",
  },
  {
    value: "BOLETO",
    title: "Boleto",
    description: "Vencimento em 1 dia útil",
    icon: "receipt",
  },
];

export default function CheckoutPage() {
  const { cart, total, clearCart } = useStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [shippingMethod, setShippingMethod] = useState("DELIVERY");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showAddress, setShowAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<ApiOrder | null>(null);

  const loadAddresses = useCallback(
    () =>
      api<Address[]>("/addresses").then((rows) => {
        setAddresses(rows);
        if (rows.length)
          setAddressId(
            (current) =>
              current ?? (rows.find((item) => item.isDefault) ?? rows[0]).id,
          );
      }),
    [],
  );
  useEffect(() => {
    void loadAddresses().catch((value: Error) => setError(value.message));
  }, [loadAddresses]);
  const delivery = shippingMethod === "PICKUP" || total >= 100 ? 0 : 7.9;

  const addAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api("/addresses", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      setShowAddress(false);
      await loadAddresses();
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Não foi possível salvar o endereço",
      );
    }
  };

  const applyCoupon = async () => {
    try {
      const data = await api<{ discount: number }>(
        `/coupons/validate?code=${encodeURIComponent(couponCode)}&subtotal=${total}`,
      );
      setDiscount(Math.min(total, data.discount));
      setError("");
    } catch (value) {
      setDiscount(0);
      setError(value instanceof Error ? value.message : "Cupom inválido");
    }
  };

  const confirm = async () => {
    if (!addressId || !cart.length) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await api<ApiOrder>("/orders", {
        method: "POST",
        body: JSON.stringify({
          addressId,
          shippingMethod,
          paymentMethod,
          couponCode: couponCode || undefined,
        }),
      });
      setOrder(created);
      clearCart();
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Não foi possível confirmar o pedido",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (order)
    return (
      <Shell>
        <main className="container confirmation">
          <section className="panel confirmation-card">
            <div className="success-icon">
              <MarketIcon name="check" />
            </div>
            <p className="eyebrow">
              Pedido #{String(order.id).padStart(6, "0")}
            </p>
            <h1>Pedido confirmado!</h1>
            <p>
              Recebemos sua compra e ela já aparece no acompanhamento de
              pedidos.
            </p>
            {order.payment?.method === "PIX" && (
              <div className="pix-box">
                <b>PIX gerado</b>
                <code>{order.payment.qrCode}</code>
                <small>Use o código acima para concluir o pagamento.</small>
              </div>
            )}
            <Link className="primary" href="/pedidos">
              Acompanhar pedido
            </Link>
          </section>
        </main>
      </Shell>
    );

  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Carrinho / Checkout</span>
          <h1>Finalizar compra</h1>
          <p>Revise a entrega e o pagamento antes de confirmar.</p>
        </header>
        <div className="content-grid">
          <section className="form-grid">
            <div className="panel">
              <div className="panel-title">
                <div>
                  <h2>1. Endereço de entrega</h2>
                  <p>Escolha onde deseja receber.</p>
                </div>
                <button
                  className="secondary"
                  onClick={() => setShowAddress(!showAddress)}
                >
                  + Novo endereço
                </button>
              </div>
              {addresses.map((address) => (
                <label
                  className={`choice ${addressId === address.id ? "selected" : ""}`}
                  key={address.id}
                >
                  <input
                    type="radio"
                    checked={addressId === address.id}
                    onChange={() => setAddressId(address.id)}
                  />
                  <div>
                    <b>{address.label || "Endereço"}</b>
                    <br />
                    <small>
                      {address.street}, {address.number} ·{" "}
                      {address.neighborhood}, {address.city}/{address.state}
                    </small>
                  </div>
                </label>
              ))}
              {!addresses.length && !showAddress && (
                <p className="empty-note">
                  Cadastre um endereço para continuar.
                </p>
              )}
              {showAddress && (
                <form className="address-form" onSubmit={addAddress}>
                  <input name="label" placeholder="Nome (Casa, Trabalho)" />
                  <input name="zipCode" placeholder="CEP" required />
                  <input name="street" placeholder="Rua" required />
                  <input name="number" placeholder="Número" required />
                  <input name="neighborhood" placeholder="Bairro" required />
                  <input name="city" placeholder="Cidade" required />
                  <input name="state" placeholder="UF" maxLength={2} required />
                  <button className="primary" type="submit">
                    Salvar endereço
                  </button>
                </form>
              )}
            </div>
            <div className="panel">
              <h2>2. Forma de entrega</h2>
              {[
                [
                  "DELIVERY",
                  "Entrega expressa",
                  delivery ? money(delivery) : "Grátis",
                ],
                ["PICKUP", "Retirar no mercado", "Grátis"],
              ].map(([value, title, info]) => (
                <label
                  className={`choice ${shippingMethod === value ? "selected" : ""}`}
                  key={value}
                >
                  <input
                    type="radio"
                    checked={shippingMethod === value}
                    onChange={() => setShippingMethod(value)}
                  />
                  <div>
                    <b>{title}</b>
                    <br />
                    <small>{info}</small>
                  </div>
                </label>
              ))}
            </div>
            <div className="panel">
              <h2>3. Pagamento</h2>
              {paymentOptions.map(({ value, title, description, icon }) => (
                <label
                  className={`choice ${paymentMethod === value ? "selected" : ""}`}
                  key={value}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />
                  <span className="choice-icon">
                    <MarketIcon name={icon} />
                  </span>
                  <div>
                    <b>{title}</b>
                    <br />
                    <small>{description}</small>
                  </div>
                </label>
              ))}
            </div>
          </section>
          <aside className="panel order-summary">
            <h2>Resumo</h2>
            {cart.map((item) => (
              <div className="summary-row" key={item.id}>
                <span>
                  {item.quantity}× {item.name}
                </span>
                <b>{money(item.price * item.quantity)}</b>
              </div>
            ))}
            <div className="coupon-row">
              <input
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(event.target.value.toUpperCase())
                }
                placeholder="Cupom"
              />
              <button onClick={applyCoupon}>Aplicar</button>
            </div>
            <div className="summary-row">
              <span>Entrega</span>
              <b>{delivery ? money(delivery) : "Grátis"}</b>
            </div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Desconto</span>
                <b>− {money(discount)}</b>
              </div>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>{money(Math.max(0, total + delivery - discount))}</span>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button
              className="primary full"
              disabled={!cart.length || !addressId || submitting}
              onClick={confirm}
            >
              {submitting
                ? "Confirmando..."
                : cart.length
                  ? "Confirmar pedido"
                  : "Carrinho vazio"}
            </button>
            <p className="secure-note">
              <MarketIcon name="lock" /> Conexão protegida.
            </p>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
