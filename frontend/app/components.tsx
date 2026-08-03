'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, fromApiProduct } from './api';
import { Product, money } from './store-data';

type CartLine = Product & { quantity: number };
type Store = {
  cart: CartLine[]; favorites: number[]; count: number; total: number;
  add: (product: Product) => void; change: (id: number, delta: number) => void;
  remove: (id: number) => void; clearCart: () => void; favorite: (id: number) => void;
  toast: string | null; dark: boolean; setDark: (value: boolean) => void; toggleDark: () => void;
};

const StoreContext = createContext<Store | null>(null);
export const useStore = () => {
  const value = useContext(StoreContext);
  if (!value) throw new Error('StoreProvider ausente');
  return value;
};

function mapCart(data: any): CartLine[] {
  return (data?.items ?? []).map((item: any) => ({
    ...fromApiProduct(item.product), price: Number(item.unitPrice), quantity: item.quantity,
  }));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [dark, setDarkState] = useState(false);
  const pathname = usePathname();

  const say = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    const savedDark = localStorage.getItem('emarket-dark') === 'true';
    setDarkState(savedDark);
    if (pathname === '/' || pathname === '/login' || pathname === '/cadastro' || pathname === '/recuperar-senha') {
      return;
    }
    Promise.all([api<any>('/cart'), api<any[]>('/favorites')])
      .then(([cartData, favoriteData]) => {
        setCart(mapCart(cartData));
        setFavorites(favoriteData.map((item: any) => item.productId));
      })
      .catch(() => undefined);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('emarket-dark', String(dark));
  }, [dark]);

  const persistTheme = (value: boolean) => {
    setDarkState(value);
    void api('/auth/settings', { method: 'PATCH', body: JSON.stringify({ theme: value ? 'dark' : 'light' }) }).catch(() => undefined);
  };

  const value = useMemo<Store>(() => ({
    cart,
    favorites,
    count: cart.reduce((sum, item) => sum + item.quantity, 0),
    total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    add: (product) => {
      setCart((current) => {
        const found = current.find((item) => item.id === product.id);
        return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
      });
      void api<any>('/cart/items', { method: 'POST', body: JSON.stringify({ productId: product.id, quantity: 1 }) })
        .then((data) => setCart(mapCart(data)))
        .catch((error) => { say(error.message); void api<any>('/cart').then((data) => setCart(mapCart(data))); });
      say(`${product.name} adicionado ao carrinho`);
    },
    change: (id, delta) => {
      const current = cart.find((item) => item.id === id);
      if (!current) return;
      const quantity = current.quantity + delta;
      setCart((items) => items.flatMap((item) => item.id !== id ? [item] : quantity <= 0 ? [] : [{ ...item, quantity }]));
      void api<any>(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) })
        .then((data) => setCart(mapCart(data))).catch((error) => say(error.message));
    },
    remove: (id) => {
      setCart((items) => items.filter((item) => item.id !== id));
      void api<any>(`/cart/items/${id}`, { method: 'DELETE' }).then((data) => setCart(mapCart(data))).catch((error) => say(error.message));
      say('Item removido do carrinho');
    },
    clearCart: () => setCart([]),
    favorite: (id) => {
      setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
      void api('/favorites/toggle', { method: 'POST', body: JSON.stringify({ productId: id }) }).catch((error) => say(error.message));
    },
    toast,
    dark,
    setDark: persistTheme,
    toggleDark: () => persistTheme(!dark),
  }), [cart, favorites, toast, dark]);

  return <StoreContext.Provider value={value}>
    {children}
    {toast && <div className="toast" role="status">{toast}</div>}
  </StoreContext.Provider>;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { count, dark, toggleDark } = useStore();
  return <div className="page">
    <div className="topbar"><div className="container"><span>Entrega rápida para sua região</span><span>Seg a sáb · 08h às 21h</span></div></div>
    <header className="header">
      <div className="container header-main">
        <Link className="logo" href="/mercado"><span className="logo-mark">e</span><span>E-Market</span></Link>
        <form className="search" action="/pesquisa"><input name="q" placeholder="Busque produtos, marcas e categorias" aria-label="Buscar produtos"/><button aria-label="Pesquisar">⌕</button></form>
        <div className="header-actions">
          <button className="icon-link" onClick={toggleDark} aria-label="Alternar tema">{dark ? '☀' : '◐'}</button>
          <Link className="icon-link favs" href="/favoritos" aria-label="Favoritos">♡</Link>
          <Link className="icon-link account" href="/configuracoes">Configurações</Link>
          <Link className="cart-link" href="/carrinho">Carrinho{count ? ` (${count})` : ''}</Link>
        </div>
      </div>
      <nav className="nav"><div className="container">
        <Link href="/categorias">Categorias</Link><Link href="/ofertas">Ofertas</Link><Link href="/categorias/hortifruti">Hortifruti</Link><Link href="/categorias/acougue">Açougue</Link><Link href="/pedidos">Meus pedidos</Link><Link href="/perfil">Minha conta</Link>
      </div></nav>
    </header>
    {children}
    <footer className="footer"><div className="container footer-grid">
      <div><Link className="logo" href="/mercado"><span className="logo-mark">e</span><span>E-Market</span></Link><p>Seu mercado de confiança, agora a um toque de distância.</p></div>
      <div><h4>Comprar</h4><Link href="/categorias">Categorias</Link><Link href="/ofertas">Ofertas do dia</Link><Link href="/favoritos">Favoritos</Link></div>
      <div><h4>Atendimento</h4><Link href="/configuracoes">Central de ajuda</Link><a href="mailto:contato@emarket.local">Fale conosco</a></div>
      <div><h4>Minha conta</h4><Link href="/perfil">Dados pessoais</Link><Link href="/pedidos">Meus pedidos</Link><Link href="/configuracoes">Configurações</Link></div>
    </div><div className="container footer-end">© 2026 E-Market · Compras simples, frescas e seguras.</div></footer>
  </div>;
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div></div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { add, favorite, favorites } = useStore();
  return <article className="product">
    <Link href={`/produtos/${product.slug}`}><div className="product-art" style={{ '--product-bg': product.bg } as React.CSSProperties}>{product.image ? <img src={product.image} alt={product.name} loading="lazy"/> : product.emoji}</div></Link>
    {product.tag && <span className="product-tag">{product.tag}</span>}
    <button className={`heart ${favorites.includes(product.id) ? 'active' : ''}`} onClick={() => favorite(product.id)} aria-label={favorites.includes(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>♥</button>
    <div className="product-info"><span className="unit">{product.brand ? `${product.brand} · ` : ''}{product.unit}</span><Link href={`/produtos/${product.slug}`}><h3>{product.name}</h3></Link>{product.oldPrice && <span className="old-price">{money(product.oldPrice)}</span>}<div className="buy-row"><span className="price">{money(product.price)}</span><button className="add" onClick={() => add(product)} aria-label={`Adicionar ${product.name}`}>+</button></div></div>
  </article>;
}
