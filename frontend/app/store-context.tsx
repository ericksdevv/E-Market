"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  api,
  ApiCart,
  ApiFavorite,
  ApiUserSettings,
  fromApiProduct,
} from "./api";
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
  clearCart: () => Promise<void>;
  reloadCart: () => Promise<void>;
  favorite: (id: number) => Promise<boolean>;
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
  const [themeReady, setThemeReady] = useState(false);
  const accountStateLoaded = useRef(false);
  const hasLocalTheme = useRef(false);
  const pendingOperations = useRef(new Set<string>());

  const beginOperation = useCallback((key: string) => {
    if (pendingOperations.current.has(key)) return false;
    pendingOperations.current.add(key);
    return true;
  }, []);

  const endOperation = useCallback((key: string) => {
    pendingOperations.current.delete(key);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const reloadCart = useCallback(async () => {
    const data = await api<ApiCart>("/cart");
    setCart(mapCart(data));
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("emarket-dark");
    hasLocalTheme.current = savedTheme !== null;
    window.requestAnimationFrame(() => {
      setDarkState(savedTheme === "true");
      setThemeReady(true);
    });
  }, []);

  useEffect(() => {
    if (publicRoutes.has(pathname)) return;
    if (accountStateLoaded.current) return;

    accountStateLoaded.current = true;

    Promise.allSettled([
      api<ApiCart>("/cart"),
      api<ApiFavorite[]>("/favorites"),
      api<ApiUserSettings>("/auth/me"),
    ]).then(([cartResult, favoritesResult, accountResult]) => {
      if (cartResult.status === "fulfilled") {
        setCart(mapCart(cartResult.value));
      }
      if (favoritesResult.status === "fulfilled") {
        setFavorites(favoritesResult.value.map((item) => item.productId));
      }
      if (
        accountResult.status === "fulfilled" &&
        !hasLocalTheme.current &&
        accountResult.value.user.theme
      ) {
        setDarkState(accountResult.value.user.theme === "dark");
      }
      if (
        cartResult.status === "rejected" &&
        favoritesResult.status === "rejected" &&
        accountResult.status === "rejected"
      ) {
        accountStateLoaded.current = false;
      }
    });
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (themeReady) localStorage.setItem("emarket-dark", String(dark));
  }, [dark, themeReady]);

  const persistTheme = useCallback(
    (value: boolean) => {
      setDarkState(value);
      setThemeReady(true);
      void api("/auth/settings", {
        method: "PATCH",
        body: JSON.stringify({ theme: value ? "dark" : "light" }),
      }).catch(() => notify("Tema aplicado somente neste dispositivo"));
    },
    [notify],
  );

  const value = useMemo<StoreState>(
    () => ({
      cart,
      favorites,
      count: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
      add: (product) => {
        if (product.stock <= 0) {
          notify("Produto indisponível no momento");
          return;
        }
        const operation = `cart:${product.id}`;
        if (!beginOperation(operation)) return;
        setCart((current) => {
          const found = current.find((item) => item.id === product.id);
          return found
            ? current.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: Math.min(item.quantity + 1, product.stock),
                    }
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
            void reloadCart().catch(() => undefined);
          })
          .finally(() => endOperation(operation));
        notify(`${product.name} adicionado ao carrinho`);
      },
      change: (id, delta) => {
        const operation = `cart:${id}`;
        if (!beginOperation(operation)) return;
        const current = cart.find((item) => item.id === id);
        if (!current) {
          endOperation(operation);
          return;
        }

        const quantity = Math.min(current.quantity + delta, current.stock);
        if (delta > 0 && quantity === current.quantity) {
          notify("Quantidade máxima disponível atingida");
          endOperation(operation);
          return;
        }
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
          .catch((error: Error) => {
            notify(error.message);
            void reloadCart().catch(() => undefined);
          })
          .finally(() => endOperation(operation));
      },
      remove: (id) => {
        const operation = `cart:${id}`;
        if (!beginOperation(operation)) return;
        setCart((items) => items.filter((item) => item.id !== id));
        void api<ApiCart>(`/cart/items/${id}`, { method: "DELETE" })
          .then((data) => setCart(mapCart(data)))
          .catch((error: Error) => {
            notify(error.message);
            void reloadCart().catch(() => undefined);
          })
          .finally(() => endOperation(operation));
        notify("Item removido do carrinho");
      },
      clearCart: async () => {
        setCart([]);
        try {
          const data = await api<ApiCart>("/cart/items", { method: "DELETE" });
          setCart(mapCart(data));
        } catch (error) {
          notify(error instanceof Error ? error.message : "Não foi possível limpar o carrinho");
          await reloadCart().catch(() => undefined);
        }
      },
      reloadCart,
      favorite: async (id) => {
        const wasFavorite = favorites.includes(id);
        const operation = `favorite:${id}`;
        if (!beginOperation(operation)) return wasFavorite;
        setFavorites((items) =>
          items.includes(id)
            ? items.filter((item) => item !== id)
            : [...items, id],
        );
        try {
          const { favorited } = await api<{ favorited: boolean }>(
            "/favorites/toggle",
            {
              method: "POST",
              body: JSON.stringify({ productId: id }),
            },
          );
          setFavorites((items) =>
            favorited
              ? Array.from(new Set([...items, id]))
              : items.filter((item) => item !== id),
          );
          return favorited;
        } catch (error) {
            setFavorites((items) =>
              wasFavorite
                ? Array.from(new Set([...items, id]))
                : items.filter((item) => item !== id),
            );
          notify(error instanceof Error ? error.message : "Não foi possível atualizar o favorito");
          return wasFavorite;
        } finally {
          endOperation(operation);
        }
      },
      toast,
      dark,
      setDark: persistTheme,
      toggleDark: () => persistTheme(!dark),
    }),
    [
      beginOperation,
      cart,
      dark,
      endOperation,
      favorites,
      notify,
      persistTheme,
      reloadCart,
      toast,
    ],
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
