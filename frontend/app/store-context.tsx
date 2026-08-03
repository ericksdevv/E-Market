"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, ApiCart, ApiFavorite, fromApiProduct } from "./api";
import type { Product } from "./store-data";

type CartLine = Product & { quantity: number };
type StoreState = {
  cart: CartLine[];
  favorites: number[];
  count: number;
  total: number;
  add: (product: Product) => void;
  change: (id: number, delta: number) => void;
  remove: (id: number) => void;
  clearCart: () => void;
  favorite: (id: number) => void;
  toast: string | null;
  dark: boolean;
  setDark: (value: boolean) => void;
  toggleDark: () => void;
};

const publicRoutes = new Set(["/", "/login", "/cadastro", "/recuperar-senha"]);
const StoreContext = createContext<StoreState | null>(null);

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("StoreProvider não encontrado");
  return value;
}

function mapCart(data: ApiCart): CartLine[] {
  return data.items.map((item) => ({
    ...fromApiProduct(item.product),
    price: Number(item.unitPrice),
    quantity: item.quantity,
  }));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [dark, setDarkState] = useState(false);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const savedDark = localStorage.getItem("emarket-dark") === "true";
    window.requestAnimationFrame(() => setDarkState(savedDark));
    if (publicRoutes.has(pathname)) return;

    Promise.all([api<ApiCart>("/cart"), api<ApiFavorite[]>("/favorites")])
      .then(([cartData, favoriteData]) => {
        setCart(mapCart(cartData));
        setFavorites(favoriteData.map((item) => item.productId));
      })
      .catch(() => undefined);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("emarket-dark", String(dark));
  }, [dark]);

  const persistTheme = useCallback((value: boolean) => {
    setDarkState(value);
    void api("/auth/settings", {
      method: "PATCH",
      body: JSON.stringify({ theme: value ? "dark" : "light" }),
    }).catch(() => undefined);
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      cart,
      favorites,
      count: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
      add: (product) => {
        setCart((current) => {
          const found = current.find((item) => item.id === product.id);
          return found
            ? current.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              )
            : [...current, { ...product, quantity: 1 }];
        });
        void api<ApiCart>("/cart/items", {
          method: "POST",
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        })
          .then((data) => setCart(mapCart(data)))
          .catch((error: Error) => {
            notify(error.message);
            void api<ApiCart>("/cart").then((data) => setCart(mapCart(data)));
          });
        notify(`${product.name} adicionado ao carrinho`);
      },
      change: (id, delta) => {
        const current = cart.find((item) => item.id === id);
        if (!current) return;

        const quantity = current.quantity + delta;
        setCart((items) =>
          items.flatMap((item) =>
            item.id !== id
              ? [item]
              : quantity <= 0
                ? []
                : [{ ...item, quantity }],
          ),
        );
        void api<ApiCart>(`/cart/items/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        })
          .then((data) => setCart(mapCart(data)))
          .catch((error: Error) => notify(error.message));
      },
      remove: (id) => {
        setCart((items) => items.filter((item) => item.id !== id));
        void api<ApiCart>(`/cart/items/${id}`, { method: "DELETE" })
          .then((data) => setCart(mapCart(data)))
          .catch((error: Error) => notify(error.message));
        notify("Item removido do carrinho");
      },
      clearCart: () => setCart([]),
      favorite: (id) => {
        setFavorites((items) =>
          items.includes(id)
            ? items.filter((item) => item !== id)
            : [...items, id],
        );
        void api("/favorites/toggle", {
          method: "POST",
          body: JSON.stringify({ productId: id }),
        }).catch((error: Error) => notify(error.message));
      },
      toast,
      dark,
      setDark: persistTheme,
      toggleDark: () => persistTheme(!dark),
    }),
    [cart, dark, favorites, notify, persistTheme, toast],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </StoreContext.Provider>
  );
}
