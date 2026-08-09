export type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number;
  unit: string;
  tag?: string;
  brand?: string;
  stock: number;
  description?: string;
};

export const categories = [
  { name: "Hortifruti", slug: "hortifruti" },
  { name: "Açougue", slug: "acougue" },
  { name: "Padaria", slug: "padaria" },
  { name: "Bebidas", slug: "bebidas" },
  { name: "Laticínios", slug: "laticinios" },
  { name: "Limpeza", slug: "limpeza" },
  { name: "Higiene", slug: "higiene" },
  { name: "Congelados", slug: "congelados" },
  { name: "Mercearia", slug: "mercearia" },
  { name: "Pet Shop", slug: "pet-shop" },
  { name: "Bazar", slug: "bazar" },
] as const;

export const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
