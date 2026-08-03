'use client';
import { useEffect, useState } from 'react';
import { api, fromApiProduct } from '../api';
import { ProductCard, Shell } from '../components';
import { Product } from '../store-data';
export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { api<any[]>('/products?offer=true').then((rows) => setProducts(rows.map(fromApiProduct))); }, []);
  return <Shell><main className="container"><header className="page-head"><span className="crumb">Início / Ofertas</span><h1>Ofertas do dia</h1><p>Preços especiais enquanto durarem os estoques.</p></header><div className="promo"><div><h2>Economize na compra da semana</h2><p>Produtos selecionados com desconto aplicado automaticamente.</p></div><strong>HOJE</strong></div><section className="product-grid page-products">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</section></main></Shell>;
}
