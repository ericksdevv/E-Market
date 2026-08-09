"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiFavorite, fromApiProduct } from "../api";
import { ProductCard, Shell } from "../components";
import { MarketIcon } from "../icons";
import { Product } from "../store-data";

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    window.requestAnimationFrame(() => {
      setLoading(true);
      setError("");
    });
    api<ApiFavorite[]>("/favorites")
      .then((rows) =>
        setProducts(rows.map((item) => fromApiProduct(item.product))),
      )
      .catch((value: Error) => setError(value.message))
      .finally(() => setLoading(false));
  }, [reload]);
  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Favoritos</span>
          <h1>Seus favoritos</h1>
          <p>Produtos salvos na sua conta.</p>
        </header>
        {loading ? (
          <div className="catalog-skeleton" aria-label="Carregando favoritos" />
        ) : error ? (
          <div className="panel empty-state">
            <h2>Não foi possível carregar seus favoritos</h2>
            <p>{error}</p>
            <button
              className="secondary"
              onClick={() => setReload((v) => v + 1)}
            >
              Tentar novamente
            </button>
          </div>
        ) : products.length ? (
          <div className="product-grid page-products">
            {products.map((product) => (
              <ProductCard
                product={product}
                key={product.id}
                onFavoriteChange={(favorited) => {
                  if (!favorited) {
                    setProducts((items) =>
                      items.filter((item) => item.id !== product.id),
                    );
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <MarketIcon name="heart" />
            <h2>Nenhum favorito ainda</h2>
            <p>Clique no coração de um produto para encontrá-lo aqui.</p>
            <Link className="primary" href="/categorias">
              Explorar produtos
            </Link>
          </div>
        )}
      </main>
    </Shell>
  );
}
