"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiProduct, fromApiProduct } from "../api";
import { ProductCard, SectionHeading, Shell } from "../components";
import { MarketIcon } from "../icons";
import { Product } from "../store-data";

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ApiProduct[]>("/products")
      .then((rows) => setProducts(rows.map(fromApiProduct)))
      .catch((value: Error) => setError(value.message))
      .finally(() => setLoading(false));
  }, []);

  const offers = products.filter((product) => product.oldPrice).slice(0, 8);

  return (
    <Shell>
      <main className="market-home">
        <div className="container market-main">
          <section className="market-hero">
            <div className="market-hero-copy">
              <h1>
                Compre bem.
                <br />
                <em>Receba em casa.</em>
              </h1>
              <p>Escolha seus produtos e acompanhe o pedido até a entrega.</p>
              <div className="market-hero-actions">
                <Link className="market-primary" href="/categorias/hortifruti">
                  Ver produtos <MarketIcon name="arrow" />
                </Link>
                <Link className="market-secondary" href="/ofertas">
                  <MarketIcon name="tag" /> Ofertas
                </Link>
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
            </div>
          </section>

          <section className="market-section">
            <SectionHeading
              eyebrow="Preços em destaque"
              title="Ofertas atuais"
              description="Produtos com preço promocional identificado no catálogo."
            />
            {loading ? (
              <div
                className="catalog-skeleton"
                aria-label="Carregando ofertas"
              />
            ) : error ? (
              <div className="panel empty-state compact">
                <h3>Não foi possível carregar o catálogo</h3>
                <p>{error}</p>
              </div>
            ) : offers.length ? (
              <>
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
              </>
            ) : (
              <div className="panel empty-state compact">
                <h3>Nenhuma oferta disponível</h3>
                <p>Os produtos promocionais aparecerão aqui.</p>
              </div>
            )}
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
