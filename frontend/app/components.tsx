'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { Product, money } from './store-data';

type CartLine = Product & { quantity: number };
type Store = {
  cart: CartLine[];
  add: (p: Product) => void;
  change: (id: number, d: number) => void;
  remove: (id: number) => void;
  count: number;
  total: number;
  favorite: (id: number) => void;
  favorites: number[];
  toast: string | null;
  dark: boolean;
  toggleDark: () => void;
};

const StoreContext = createContext<Store | null>(null);

export const useStore = () => {
  const value = useContext(StoreContext);
  if (!value) throw new Error('StoreProvider ausente');
  return value;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('emarket-cart');
    const savedFavorites = localStorage.getItem('emarket-favorites');
    const savedDark = localStorage.getItem('emarket-dark');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    setDark(savedDark === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('emarket-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('emarket-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('emarket-dark', String(dark));
  }, [dark]);

  const say = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const value = useMemo<Store>(
    () => ({
      cart,
      count: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
      add: (product: Product) => {
        setCart((current) => {
          const found = current.find((item) => item.id === product.id);
          return found
            ? current.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              )
            : [...current, { ...product, quantity: 1 }];
        });
        void api('/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        }).catch(() => undefined);
        say(`${product.name} adicionado ao carrinho`);
      },
      change: (id: number, delta: number) => {
        setCart((current) => {
          const item = current.find((entry) => entry.id === id);
          if (item) {
            void api(`/cart/items/${id}`, {
              method: 'PATCH',
              body: JSON.stringify({ quantity: item.quantity + delta }),
            }).catch(() => undefined);
          }
          return current.flatMap((entry) =>
            entry.id === id && entry.quantity + delta <= 0
              ? []
              : entry.id === id
                ? [{ ...entry, quantity: entry.quantity + delta }]
                : [entry],
          );
        });
      },
      remove: (id: number) => {
        setCart((current) => current.filter((item) => item.id !== id));
        void api(`/cart/items/${id}`, { method: 'DELETE' }).catch(() => undefined);
        say('Item removido do carrinho');
      },
      favorite: (id: number) => {
        setFavorites((current) => {
          const next = current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id];
          void api('/favorites/toggle', {
            method: 'POST',
            body: JSON.stringify({ productId: id }),
          }).catch(() => undefined);
          return next;
        });
      },
      favorites,
      toast,
      dark,
      toggleDark: () => setDark((current) => !current),
    }),
    [cart, favorites, toast, dark],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          OK · {toast}
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { count, dark, toggleDark } = useStore();

  return (
    <div className="page">
      <div className="topbar">
        <div className="container">
          <span>Entrega rápida para sua região</span>
          <span>Seg a sáb · 08h às 21h</span>
        </div>
      </div>
      <header className="header">
        <div className="container header-main">
          <Link className="logo" href="/">
            <span className="logo-mark">e</span>
            <span>E-Market</span>
          </Link>
          <form className="search" action="/pesquisa">
            <input name="q" placeholder="Busque produtos, marcas e categorias" aria-label="Buscar produtos" />
            <span>⌕</span>
          </form>
          <div className="header-actions">
            <button className="icon-link" onClick={toggleDark} aria-label="Alternar tema">
              {dark ? '☀' : '◐'}
            </button>
            <Link className="icon-link favs" href="/favoritos">
              ♡
            </Link>
            <Link className="icon-link account" href="/configuracoes">
              Configurações
            </Link>
            <Link className="cart-link" href="/carrinho">
              Carrinho{count ? ` (${count})` : ''}
            </Link>
          </div>
        </div>
        <nav className="nav">
          <div className="container">
            <Link href="/categorias">Categorias</Link>
            <Link href="/ofertas">Ofertas</Link>
            <Link href="/produtos/picanha-friboi-peca">Mais vendidos</Link>
            <Link href="/categorias/hortifruti">Hortifruti</Link>
            <Link href="/categorias/acougue">Açougue</Link>
            <Link href="/pedidos">Meus pedidos</Link>
            <Link href="/configuracoes">Configurações</Link>
          </div>
        </nav>
      </header>
      {children}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link className="logo" href="/">
              <span className="logo-mark">e</span>
              <span>E-Market</span>
            </Link>
            <p>Seu mercado de confiança, agora a um toque de distância.</p>
          </div>
          <div>
            <h4>Comprar</h4>
            <Link href="/categorias">Categorias</Link>
            <Link href="/ofertas">Ofertas do dia</Link>
            <Link href="/favoritos">Favoritos</Link>
          </div>
          <div>
            <h4>Atendimento</h4>
            <a href="#">Central de ajuda</a>
            <a href="#">Fale conosco</a>
          </div>
          <div>
            <h4>Minha conta</h4>
            <Link href="/login">Entrar</Link>
            <Link href="/pedidos">Meus pedidos</Link>
            <Link href="/configuracoes">Configurações</Link>
          </div>
        </div>
        <div className="container footer-end">© 2026 E-Market · Compras simples, frescas e seguras.</div>
      </footer>
    </div>
  );
}

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
        {eyebrow && <p className="eyebrow" style={{ color: '#17683a' }}>{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add, favorite, favorites } = useStore();

  return (
    <article className="product">
      <Link href={`/produtos/${product.slug}`}>
        <div className="product-art" style={{ '--product-bg': product.bg } as React.CSSProperties}>
          {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : product.emoji}
        </div>
      </Link>
      {product.tag && <span className="product-tag">{product.tag}</span>}
      <button
        className={`heart ${favorites.includes(product.id) ? 'active' : ''}`}
        onClick={() => favorite(product.id)}
        aria-label="Adicionar aos favoritos"
      >
        ♥
      </button>
      <div className="product-info">
        <span className="unit">{product.brand ? `${product.brand} · ` : ''}{product.unit}</span>
        <Link href={`/produtos/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        {product.oldPrice && <span className="old-price">{money(product.oldPrice)}</span>}
        <div className="buy-row">
          <span className="price">{money(product.price)}</span>
          <button className="add" onClick={() => add(product)} aria-label={`Adicionar ${product.name}`}>
            +
          </button>
        </div>
      </div>
    </article>
  );
}
