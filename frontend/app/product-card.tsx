"use client";

import Link from "next/link";
import { MarketIcon, productIcon } from "./icons";
import { money, type Product } from "./store-data";
import { useStore } from "./store-context";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export function ProductCard({
  product,
  onFavoriteChange,
}: {
  product: Product;
  onFavoriteChange?: (favorited: boolean) => void;
}) {
  const { add, favorite, favorites } = useStore();
  const isFavorite = favorites.includes(product.id);

  return (
    <article className="product">
      <Link href={`/produtos/${product.slug}`}>
        <div className="product-art product-symbol">
          <MarketIcon name={productIcon(product)} />
          <small>{product.brand ?? product.category}</small>
        </div>
      </Link>
      {product.tag && <span className="product-tag">{product.tag}</span>}
      <button
        className={`heart ${isFavorite ? "active" : ""}`}
        onClick={() => {
          void favorite(product.id).then(onFavoriteChange);
        }}
        aria-label={
          isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
      >
        <MarketIcon name="heart" />
      </button>
      <div className="product-info">
        <span className="unit">
          {product.brand ? `${product.brand} · ` : ""}
          {product.unit}
        </span>
        <Link href={`/produtos/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        {product.oldPrice && (
          <span className="old-price">{money(product.oldPrice)}</span>
        )}
        <div className="buy-row">
          <span className="price">{money(product.price)}</span>
          <button
            className="add"
            disabled={product.stock <= 0}
            onClick={() => add(product)}
            aria-label={
              product.stock > 0
                ? `Adicionar ${product.name}`
                : `${product.name} indisponível`
            }
          >
            {product.stock > 0 ? <MarketIcon name="cart" /> : "Esgotado"}
          </button>
        </div>
      </div>
    </article>
  );
}
