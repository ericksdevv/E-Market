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
];

export const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Leite em Pó Integral Camponesa",
    slug: "leite-em-po-camponesa-200g",
    category: "Laticínios",
    brand: "Camponesa",
    price: 8.18,
    oldPrice: 9.49,
    unit: "200 g",
    tag: "Oferta",
  },
  {
    id: 2,
    name: "Picanha Bovina Friboi",
    slug: "picanha-friboi-peca",
    category: "Açougue",
    brand: "Friboi",
    price: 79.9,
    oldPrice: 92.9,
    unit: "aprox. 1 kg",
    tag: "Oferta",
  },
  {
    id: 3,
    name: "Peito de Frango Sadia",
    slug: "peito-de-frango-sadia",
    category: "Açougue",
    brand: "Sadia",
    price: 18.99,
    oldPrice: 22.9,
    unit: "1 kg",
    tag: "Oferta",
  },
  {
    id: 4,
    name: "Banana Nanica",
    slug: "banana-nanica",
    category: "Hortifruti",
    price: 6.9,
    oldPrice: 8.5,
    unit: "1 kg",
    tag: "Oferta",
  },
  {
    id: 5,
    name: "Pão Francês",
    slug: "pao-frances",
    category: "Padaria",
    price: 14.99,
    unit: "1 kg",
  },
  {
    id: 6,
    name: "Detergente Neutro",
    slug: "detergente-neutro",
    category: "Limpeza",
    price: 2.99,
    oldPrice: 3.79,
    unit: "500 ml",
    tag: "Oferta",
  },
  {
    id: 7,
    name: "Arroz Tipo 1",
    slug: "arroz-tipo-1",
    category: "Mercearia",
    price: 25.9,
    unit: "Pacote 5 kg",
  },
  {
    id: 8,
    name: "Pizza de Calabresa",
    slug: "pizza-calabresa",
    category: "Congelados",
    price: 18.9,
    unit: "460 g",
  },
];

export const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
