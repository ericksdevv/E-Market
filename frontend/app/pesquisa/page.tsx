"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, ApiProduct, fromApiProduct } from "../api";
import { ProductCard, Shell } from "../components";
import { MarketIcon } from "../icons";
import { Product } from "../store-data";

function SearchContent() {
  const query = useSearchParams().get("q")?.trim() ?? "";
  const [result, setResult] = useState<{ query: string; products: Product[] }>({
    query: "",
    products: [],
  });

  useEffect(() => {
    if (!query) return;
    api<ApiProduct[]>(`/products?q=${encodeURIComponent(query)}`).then((rows) =>
      setResult({ query, products: rows.map(fromApiProduct) }),
    );
  }, [query]);

  const products = result.query === query ? result.products : [];
  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Busca</span>
          <h1>Resultados da busca</h1>
          <p>
            {query
              ? `${products.length} produto(s) para “${query}”.`
              : "Digite um produto, marca ou categoria."}
          </p>
        </header>
        {products.length ? (
          <section className="product-grid page-products">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          query && (
            <div className="panel empty-state">
              <MarketIcon name="search" />
              <h2>Nenhum produto encontrado</h2>
              <p>
                Revise o termo pesquisado ou escolha uma categoria na barra
                lateral.
              </p>
            </div>
          )
        )}
      </main>
    </Shell>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="app-loading">
          <span className="loading-logo">e</span>
          <p>Buscando produtos...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
