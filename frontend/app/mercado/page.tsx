"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiProduct, fromApiProduct } from "../api";
import { ProductCard, SectionHeading, Shell } from "../components";
import { MarketIcon } from "../icons";
import { featuredProducts, Product } from "../store-data";

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>(featuredProducts);

  useEffect(() => {
    api<ApiProduct[]>("/products")
      .then((rows) => setProducts(rows.map(fromApiProduct)))
      .catch(() => undefined);
  }, []);

  const offers = products.filter((product) => product.oldPrice).slice(0, 8);

  return (
    <Shell>
      <main className="market-home">
        <div className="container market-main">
          <section className="market-hero">
            <div className="market-hero-copy">
              <span className="market-kicker">
                <MarketIcon name="basket" /> Mercado online
              </span>
              <h1>
                Compre bem.
                <br />
                <em>Receba em casa.</em>
              </h1>
              <p>
                Produtos para o dia a dia, entrega acompanhada e pagamento
                seguro.
              </p>
              <div className="market-hero-actions">
                <Link className="market-primary" href="/categorias/hortifruti">
                  Ver produtos <MarketIcon name="arrow" />
                </Link>
                <Link className="market-secondary" href="/ofertas">
                  <MarketIcon name="tag" /> Ofertas
                </Link>
              </div>
              <div className="market-proof">
                <span>
                  <MarketIcon name="check" /> Catálogo organizado
                </span>
                <span>
                  <MarketIcon name="check" /> Pagamento protegido
                </span>
              </div>
            </div>
            <div className="market-hero-art" aria-hidden="true">
              <div className="hero-orbit orbit-one">
                <MarketIcon name="leaf" />
              </div>
              <div className="hero-orbit orbit-two">
                <MarketIcon name="bread" />
              </div>
              <div className="hero-orbit orbit-three">
                <MarketIcon name="milk" />
              </div>
              <div className="hero-basket">
                <MarketIcon name="basket" />
              </div>
              <div className="hero-delivery-card">
                <span>
                  <MarketIcon name="truck" />
                </span>
                <div>
                  <strong>Entrega acompanhada</strong>
                  <small>Consulte o status do pedido</small>
                </div>
              </div>
            </div>
          </section>

          <section
            className="market-benefits"
            aria-label="Serviços do E-Market"
          >
            <article>
              <span>
                <MarketIcon name="truck" />
              </span>
              <div>
                <strong>Entrega</strong>
                <small>Prazo informado no checkout</small>
              </div>
            </article>
            <article>
              <span>
                <MarketIcon name="leaf" />
              </span>
              <div>
                <strong>Departamentos</strong>
                <small>Produtos organizados</small>
              </div>
            </article>
            <article>
              <span>
                <MarketIcon name="shield" />
              </span>
              <div>
                <strong>Compra protegida</strong>
                <small>Sessão autenticada</small>
              </div>
            </article>
          </section>

          <section className="market-section">
            <SectionHeading
              eyebrow="Preços em destaque"
              title="Ofertas atuais"
              description="Produtos com preço promocional identificado no catálogo."
            />
            <div className="market-product-grid">
              {offers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="section-action">
              <Link href="/ofertas">
                Ver ofertas <MarketIcon name="arrow" />
              </Link>
            </div>
          </section>

          <section className="market-promo-band">
            <div className="promo-band-icon">
              <MarketIcon name="clock" />
            </div>
            <div>
              <span>Histórico</span>
              <h2>Consulte seus pedidos.</h2>
              <p>Acompanhe o status e os itens de cada compra.</p>
            </div>
            <Link href="/pedidos">
              Ver pedidos <MarketIcon name="arrow" />
            </Link>
          </section>
        </div>
      </main>
    </Shell>
  );
}
