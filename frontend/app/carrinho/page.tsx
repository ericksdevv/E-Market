"use client";

import Link from "next/link";
import { Shell, useStore } from "../components";
import { MarketIcon, productIcon } from "../icons";
import { money } from "../store-data";

export default function CartPage() {
  const { cart, total, change, remove } = useStore();
  const delivery = cart.length && total < 100 ? 7.9 : 0;

  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Carrinho</span>
          <h1>Carrinho</h1>
          <p>
            {cart.length
              ? "Revise os itens antes de finalizar a compra."
              : "Nenhum item adicionado."}
          </p>
        </header>
        <div className="content-grid">
          <section className="panel">
            {cart.length ? (
              cart.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item-art">
                    <MarketIcon name={productIcon(item)} />
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.unit} · {money(item.price)} cada
                    </p>
                    <div className="quantity">
                      <button
                        onClick={() => change(item.id, -1)}
                        aria-label="Diminuir"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => change(item.id, 1)}
                        aria-label="Aumentar"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <b>{money(item.price * item.quantity)}</b>
                    <button
                      className="danger-link"
                      onClick={() => remove(item.id)}
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <MarketIcon name="cart" />
                <h2>Carrinho vazio</h2>
                <p>Escolha uma categoria para adicionar produtos.</p>
                <Link className="primary" href="/categorias/hortifruti">
                  Ver produtos
                </Link>
              </div>
            )}
          </section>
          <aside className="panel order-summary">
            <h2>Resumo do pedido</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <b>{money(total)}</b>
            </div>
            <div className="summary-row">
              <span>Entrega</span>
              <b>{delivery ? money(delivery) : "Grátis"}</b>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{money(total + delivery)}</span>
            </div>
            {cart.length > 0 && total < 100 && (
              <p className="secure-note">
                Faltam {money(100 - total)} para frete grátis.
              </p>
            )}
            {cart.length > 0 && (
              <Link className="primary full" href="/checkout">
                Ir para o checkout <MarketIcon name="arrow" />
              </Link>
            )}
            <Link
              className="text-link cart-continue"
              href="/categorias/hortifruti"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
