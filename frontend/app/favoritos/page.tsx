"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiFavorite, fromApiProduct } from "../api";
import { ProductCard, Shell } from "../components";
import { Product } from "../store-data";

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<ApiFavorite[]>("/favorites")
      .then((rows) =>
        setProducts(rows.map((item) => fromApiProduct(item.product))),
      )
      .finally(() => setLoading(false));
  }, []);
  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Favoritos</span>
          <h1>Seus favoritos</h1>
          <p>Produtos salvos na sua conta.</p>
        </header>
        {loading ? (
          <div className="panel">Carregando favoritos...</div>
        ) : products.length ? (
          <div className="product-grid page-products">
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <div>♡</div>
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
