"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { categoryIcon, MarketIcon } from "./icons";
import { categories } from "./store-data";
import { useStore } from "./store-context";

export function Shell({ children }: { children: React.ReactNode }) {
  const { count, dark, toggleDark } = useStore();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("emarket-sidebar");
    window.requestAnimationFrame(() =>
      setSidebarOpen(
        saved === null ? window.innerWidth > 900 : saved === "true",
      ),
    );
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 900) {
      window.requestAnimationFrame(() => setSidebarOpen(false));
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarOpen((current) => {
      localStorage.setItem("emarket-sidebar", String(!current));
      return !current;
    });
  };

  return (
    <div
      className={`page app-frame ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <header className="header">
        <div className="app-wide header-main">
          <Link className="logo" href="/mercado">
            <span className="logo-mark">e</span>
            <span>E-Market</span>
          </Link>
          <button
            className={`sidebar-toggle ${sidebarOpen ? "active" : ""}`}
            type="button"
            onClick={toggleSidebar}
            aria-label={
              sidebarOpen ? "Fechar departamentos" : "Abrir departamentos"
            }
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <form className="search" action="/pesquisa">
            <input
              name="q"
              placeholder="Busque produtos, marcas e categorias"
              aria-label="Buscar produtos"
            />
            <button aria-label="Pesquisar">
              <MarketIcon name="search" />
            </button>
          </form>
          <div className="header-actions">
            <button
              className="icon-link header-icon-button"
              onClick={toggleDark}
              aria-label="Alternar tema"
            >
              <MarketIcon name={dark ? "sun" : "moon"} />
            </button>
            <Link
              className="icon-link favs header-icon-button"
              href="/favoritos"
              aria-label="Favoritos"
            >
              <MarketIcon name="heart" />
            </Link>
            <Link
              className="icon-link account header-settings"
              href="/configuracoes"
            >
              <MarketIcon name="settings" />
              <span>Configurações</span>
            </Link>
            <Link
              className="cart-link"
              href="/carrinho"
              aria-label={count ? `Carrinho, ${count} itens` : "Carrinho"}
            >
              <MarketIcon name="cart" />
              <span>Carrinho</span>
              {count ? <b>{count}</b> : null}
            </Link>
          </div>
        </div>
      </header>

      <aside
        className={`global-sidebar ${sidebarOpen ? "open" : ""}`}
        aria-label="Departamentos"
      >
        <div className="global-sidebar-head">
          <span className="sidebar-title-icon">
            <MarketIcon name="basket" />
          </span>
          <div>
            <strong>Departamentos</strong>
            <small>Encontre por categoria</small>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Fechar departamentos"
          >
            ×
          </button>
        </div>
        <nav className="global-sidebar-categories">
          {categories.map((category) => (
            <Link
              className={
                pathname.startsWith(`/categorias/${category.slug}`)
                  ? "active"
                  : ""
              }
              href={`/categorias/${category.slug}`}
              key={category.slug}
            >
              <span className={`sidebar-category-icon icon-${category.slug}`}>
                <MarketIcon name={categoryIcon[category.slug] ?? "basket"} />
              </span>
              <span>{category.name}</span>
              <MarketIcon className="sidebar-arrow" name="arrow" />
            </Link>
          ))}
        </nav>
        <div className="global-sidebar-shortcuts">
          <Link
            className={pathname === "/ofertas" ? "active" : ""}
            href="/ofertas"
          >
            <MarketIcon name="tag" />
            <span>Ofertas</span>
          </Link>
          <Link
            className={pathname === "/favoritos" ? "active" : ""}
            href="/favoritos"
          >
            <MarketIcon name="heart" />
            <span>Favoritos</span>
          </Link>
          <Link
            className={pathname === "/pedidos" ? "active" : ""}
            href="/pedidos"
          >
            <MarketIcon name="clock" />
            <span>Pedidos</span>
          </Link>
        </div>
      </aside>

      <button
        className={`sidebar-scrim ${sidebarOpen ? "visible" : ""}`}
        type="button"
        onClick={toggleSidebar}
        aria-label="Fechar menu de departamentos"
      />
      <div className="app-main-area">
        {children}
        <footer className="footer">
          <div className="container footer-grid">
            <div>
              <Link className="logo" href="/mercado">
                <span className="logo-mark">e</span>
                <span>E-Market</span>
              </Link>
              <p>Compras online com entrega acompanhada.</p>
            </div>
            <div>
              <h4>Comprar</h4>
              <Link href="/categorias">Categorias</Link>
              <Link href="/ofertas">Ofertas</Link>
              <Link href="/favoritos">Favoritos</Link>
            </div>
            <div>
              <h4>Atendimento</h4>
              <Link href="/configuracoes">Configurações</Link>
              <a href="mailto:contato@emarket.local">Fale conosco</a>
            </div>
            <div>
              <h4>Minha conta</h4>
              <Link href="/perfil">Dados pessoais</Link>
              <Link href="/pedidos">Pedidos</Link>
              <Link href="/configuracoes">Preferências</Link>
            </div>
          </div>
          <div className="container footer-end">© 2026 E-Market.</div>
        </footer>
      </div>
    </div>
  );
}
