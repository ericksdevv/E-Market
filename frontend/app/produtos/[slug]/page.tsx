"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiProduct, fromApiProduct } from "../../api";
import { Shell, useStore } from "../../components";
import { MarketIcon, productIcon } from "../../icons";
import { Product, money } from "../../store-data";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { add, favorite, favorites } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [details, setDetails] = useState<ApiProduct | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<ApiProduct>(`/products/${slug}`)
      .then((data) => {
        setDetails(data);
        setProduct(fromApiProduct(data));
      })
      .catch((value: Error) => setError(value.message));
  }, [slug]);

  if (error)
    return (
      <Shell>
        <main className="container">
          <div className="panel empty-state">
            <h1>Produto não encontrado</h1>
            <p>{error}</p>
            <Link className="primary" href="/categorias/hortifruti">
              Voltar aos produtos
            </Link>
          </div>
        </main>
      </Shell>
    );
  if (!product || !details)
    return (
      <Shell>
        <main className="container">
          <div className="panel product-loading">Carregando produto...</div>
        </main>
      </Shell>
    );

  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">
            Início / {product.category} / {product.name}
          </span>
        </header>
        <div className="product-detail">
          <section className="panel product-gallery">
            <div className="product-main-image product-symbol">
              <MarketIcon name={productIcon(product)} />
              <small>{product.brand ?? product.category}</small>
            </div>
            <div className="product-description">
              <h2>Informações do produto</h2>
              <p>
                {details.description ||
                  `${product.name}, disponível para compra e entrega.`}
              </p>
              <div className="product-facts">
                <span>
                  <b>Marca</b>
                  {product.brand || "Não informada"}
                </span>
                <span>
                  <b>Conteúdo</b>
                  {product.unit}
                </span>
                <span>
                  <b>Categoria</b>
                  {product.category}
                </span>
                <span>
                  <b>Estoque</b>
                  {details.stock ?? 0} unidades
                </span>
              </div>
            </div>
          </section>
          <aside className="panel product-buy">
            <span className="product-tag static">
              {product.tag || "Disponível"}
            </span>
            <p className="unit">
              {product.brand} · {product.unit}
            </p>
            <h1>{product.name}</h1>
            {product.oldPrice && (
              <span className="old-price">De {money(product.oldPrice)}</span>
            )}
            <div className="price product-price">{money(product.price)}</div>
            <p className="stock-note">
              <MarketIcon name="check" /> Em estoque
            </p>
            <button className="primary full" onClick={() => add(product)}>
              Adicionar ao carrinho
            </button>
            <button
              className="secondary full"
              onClick={() => favorite(product.id)}
            >
              <MarketIcon name="heart" />{" "}
              {favorites.includes(product.id)
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"}
            </button>
            <div className="delivery-note">
              <b>Prazo de entrega</b>
              <small>Calculado no checkout conforme o endereço.</small>
            </div>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
