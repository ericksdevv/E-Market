"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiProduct, fromApiProduct } from "../../api";
import { ProductCard, Shell } from "../../components";
import { Product } from "../../store-data";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<ApiProduct[]>(`/products?category=${slug}&sort=${sort}`)
      .then((rows) => setProducts(rows.map(fromApiProduct)))
      .finally(() => setLoading(false));
  }, [slug, sort]);
  const label = slug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (value) => value.toUpperCase())
    .replace("Acougue", "Açougue");
  return (
    <Shell>
      <main className="container">
        <header className="page-head catalog-head">
          <div>
            <span className="crumb">Início / Categorias / {label}</span>
            <h1>{label}</h1>
            <p>{products.length} produtos encontrados nesta categoria.</p>
          </div>
          <label className="sort-control">
            Ordenar por
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name">Nome</option>
            </select>
          </label>
        </header>
        {loading ? (
          <div className="panel">Carregando produtos...</div>
        ) : products.length ? (
          <section className="product-grid page-products">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <div className="panel empty-state">
            <h2>Nenhum produto nesta categoria</h2>
            <p>Estamos atualizando o catálogo. Tente novamente em breve.</p>
          </div>
        )}
      </main>
    </Shell>
  );
}
