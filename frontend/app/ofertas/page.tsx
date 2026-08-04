"use client";
import { useEffect, useState } from "react";
import { api, ApiProduct, fromApiProduct } from "../api";
import { ProductCard, Shell } from "../components";
import { Product } from "../store-data";
export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api<ApiProduct[]>("/products?offer=true")
      .then((rows) => setProducts(rows.map(fromApiProduct)))
      .catch((value: Error) => setError(value.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Ofertas</span>
          <h1>Ofertas do dia</h1>
          <p>Preços especiais enquanto durarem os estoques.</p>
        </header>
        <div className="promo">
          <div>
            <h2>Economize na compra da semana</h2>
            <p>Produtos selecionados com desconto aplicado automaticamente.</p>
          </div>
          <strong>HOJE</strong>
        </div>
        {loading ? (
          <div className="catalog-skeleton" aria-label="Carregando ofertas" />
        ) : error ? (
          <div className="panel empty-state">
            <h2>Não foi possível carregar as ofertas</h2>
            <p>{error}</p>
          </div>
        ) : products.length ? (
          <section className="product-grid page-products">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <div className="panel empty-state">
            <h2>Nenhuma oferta disponível</h2>
            <p>Os produtos promocionais aparecerão aqui.</p>
          </div>
        )}
      </main>
    </Shell>
  );
}
