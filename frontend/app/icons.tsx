import type { SVGProps } from "react";

export type MarketIconName =
  | "leaf"
  | "beef"
  | "bread"
  | "drink"
  | "milk"
  | "cleaning"
  | "hygiene"
  | "snowflake"
  | "pantry"
  | "paw"
  | "basket"
  | "truck"
  | "shield"
  | "sparkles"
  | "moon"
  | "sun"
  | "heart"
  | "settings"
  | "cart"
  | "search"
  | "arrow"
  | "tag"
  | "clock"
  | "user"
  | "mail"
  | "lock"
  | "check"
  | "card"
  | "pix"
  | "receipt"
  | "package";

export const categoryIcon: Record<string, MarketIconName> = {
  hortifruti: "leaf",
  acougue: "beef",
  padaria: "bread",
  bebidas: "drink",
  laticinios: "milk",
  limpeza: "cleaning",
  higiene: "hygiene",
  congelados: "snowflake",
  mercearia: "pantry",
  "pet-shop": "paw",
  bazar: "basket",
};

export function productIcon(product: {
  name: string;
  category: string;
  slug: string;
}): MarketIconName {
  const value = `${product.name} ${product.category} ${product.slug}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/leite|queijo|iogurte|laticinio/.test(value)) return "milk";
  if (/picanha|carne|frango|linguica|acougue/.test(value)) return "beef";
  if (/pao|bolo|padaria/.test(value)) return "bread";
  if (/bebida|refrigerante|suco|agua|coca|guarana/.test(value)) return "drink";
  if (/detergente|limpeza|desinfetante|sabao/.test(value)) return "cleaning";
  if (/higiene|sabonete|xampu|shampoo|creme dental/.test(value))
    return "hygiene";
  if (/congelado|pizza|sorvete/.test(value)) return "snowflake";
  if (/arroz|feijao|farinha|cafe|mercearia/.test(value)) return "pantry";
  if (/pet|racao/.test(value)) return "paw";
  if (/banana|fruta|verdura|hortifruti/.test(value)) return "leaf";
  return categoryIcon[product.slug] ?? "basket";
}

export function MarketIcon({
  name,
  ...props
}: { name: MarketIconName } & SVGProps<SVGSVGElement>) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<MarketIconName, React.ReactNode> = {
    leaf: (
      <>
        <path d="M19 4C11 4 5.5 8.2 5.5 14.2c0 2.9 2 5.3 4.8 5.3C16.8 19.5 20 11.5 19 4Z" />
        <path d="M5 21c2-5.1 5.4-8.7 10.5-11.2" />
      </>
    ),
    beef: (
      <>
        <path d="M8.2 7.2c2.9-2.8 8.6-2.6 11.1.6 2.3 3 .6 8.2-3.1 10.7-3.8 2.5-9.3 1.6-11.3-1.8-1.8-3 .3-6.6 3.3-9.5Z" />
        <circle cx="14.8" cy="12.4" r="2.2" />
      </>
    ),
    bread: (
      <>
        <path d="M4.5 12.2c0-4.1 3.3-7.4 7.4-7.4h.2c4.1 0 7.4 3.3 7.4 7.4v5.5c0 .9-.7 1.5-1.5 1.5H6c-.8 0-1.5-.6-1.5-1.5v-5.5Z" />
        <path d="m9 8 1.5 2M14 7.5l1.4 2" />
      </>
    ),
    drink: (
      <>
        <path d="M7 4h10l-1 16H8L7 4Z" />
        <path d="M9 9h6M14.5 4l2-2" />
      </>
    ),
    milk: (
      <>
        <path d="M8 7h8l1.5 3v10h-11V10L8 7Z" />
        <path d="M8 7V4h6l2 3M10 13h4" />
      </>
    ),
    cleaning: (
      <>
        <path d="M8.5 6.5h7l1 3v10h-9v-10l1-3Z" />
        <path d="M10 6.5V3h4v3.5M9.5 13h5M12 10v6" />
      </>
    ),
    hygiene: (
      <>
        <path d="M7 12.5c0-4.2 2.2-7.5 5-7.5s5 3.3 5 7.5S14.8 20 12 20s-5-3.3-5-7.5Z" />
        <path d="M9.5 11.5c1.8-1.5 3.2-1.5 5 0M10 15h4" />
      </>
    ),
    snowflake: (
      <>
        <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 5.5 12 8l2.5-2.5M9.5 18.5 12 16l2.5 2.5" />
      </>
    ),
    pantry: (
      <>
        <path d="M6 5h12v15H6zM8.5 9h7M8.5 13h7M8.5 17h4" />
      </>
    ),
    paw: (
      <>
        <circle cx="8" cy="8" r="2" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="5.5" cy="13" r="1.7" />
        <circle cx="18.5" cy="13" r="1.7" />
        <path d="M8 17.2c0-2.4 1.8-4.2 4-4.2s4 1.8 4 4.2c0 2-1.5 2.8-4 2.8s-4-.8-4-2.8Z" />
      </>
    ),
    basket: (
      <>
        <path d="m5 10 1.5 10h11L19 10H5ZM8 10l4-6 4 6" />
        <path d="M9 14v3M12 14v3M15 14v3" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17.5" cy="18" r="2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3ZM5.5 13l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6.6-1.9Z" />
      </>
    ),
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    heart: (
      <path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 6l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.3a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    cart: (
      <>
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H7" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    tag: (
      <>
        <path d="M20 13 13 20l-9-9V4h7l9 9Z" />
        <circle cx="8.5" cy="8.5" r="1.2" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21c.7-4.1 3.3-6.2 7.5-6.2s6.8 2.1 7.5 6.2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    pix: (
      <>
        <path d="m12 3 4.5 4.5L12 12 7.5 7.5 12 3Z" />
        <path d="m12 12 4.5 4.5L12 21l-4.5-4.5L12 12ZM7.5 7.5 3 12l4.5 4.5M16.5 7.5 21 12l-4.5 4.5" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
    package: (
      <>
        <path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" />
        <path d="m4 7 8 4 8-4M12 11v10M8 5l8 4" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common} {...props}>
      {paths[name]}
    </svg>
  );
}
