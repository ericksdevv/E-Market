import { Product } from "./store-data";

export type ApiCategory = { id: number; name: string; slug: string };
export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  price: number | string;
  promotionalPrice?: number | string | null;
  unit?: string | null;
  stock?: number;
  category?: ApiCategory | null;
};
export type ApiCart = {
  items: Array<{
    product: ApiProduct;
    unitPrice: number | string;
    quantity: number;
  }>;
};
export type ApiFavorite = { productId: number; product: ApiProduct };
export type ApiUserSettings = {
  user: { theme?: string; orderUpdates: boolean; marketingEmails: boolean };
};
export type ApiOrder = {
  id: number;
  status: string;
  total: number | string;
  createdAt: string;
  items: Array<{ id: number; name: string; quantity: number }>;
  payment?: { method?: string; qrCode?: string | null } | null;
};

type ApiError = { message?: string | string[] } | null;

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as ApiError | T;
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined")
      window.location.href = "/login";
    const error = data as ApiError;
    throw new Error(
      Array.isArray(error?.message)
        ? error.message[0]
        : (error?.message ?? "Não foi possível concluir a solicitação"),
    );
  }
  return data as T;
}

export function fromApiProduct(value: ApiProduct): Product {
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    category: value.category?.name ?? "Mercado",
    brand: value.brand ?? undefined,
    price: Number(value.promotionalPrice ?? value.price),
    oldPrice: value.promotionalPrice ? Number(value.price) : undefined,
    unit: value.unit ?? "",
    tag: value.promotionalPrice ? "Oferta" : undefined,
  };
}
