import { Product } from './store-data';

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') window.location.href = '/login';
    throw new Error(Array.isArray(data?.message) ? data.message[0] : data?.message ?? 'Não foi possível concluir a solicitação');
  }
  return data as T;
}

export function fromApiProduct(value: any): Product {
  return {
    id: value.id, name: value.name, slug: value.slug,
    category: value.category?.name ?? 'Mercado', brand: value.brand ?? undefined,
    price: Number(value.promotionalPrice ?? value.price),
    oldPrice: value.promotionalPrice ? Number(value.price) : undefined,
    unit: value.unit ?? '', emoji: '🛍️', tag: value.promotionalPrice ? 'Oferta' : undefined,
    bg: '#f3f7f0', image: value.images?.[0]?.url,
  };
}
