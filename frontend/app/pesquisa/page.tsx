'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { api, fromApiProduct } from '../api';
import { ProductCard, Shell } from '../components';
import { Product } from '../store-data';
function SearchContent() {
  const q = useSearchParams().get('q') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { if (q) api<any[]>(`/products?q=${encodeURIComponent(q)}`).then((rows) => setProducts(rows.map(fromApiProduct))); else setProducts([]); }, [q]);
  return <Shell><main className="container"><header className="page-head"><span className="crumb">Início / Busca</span><h1>Resultados da busca</h1><p>{q ? `${products.length} produto(s) para “${q}”.` : 'Digite um produto, marca ou categoria.'}</p></header>{products.length ? <section className="product-grid page-products">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</section> : q && <div className="panel empty-state"><div>⌕</div><h2>Nenhum produto encontrado</h2><p>Tente um termo mais simples ou navegue pelas categorias.</p></div>}</main></Shell>;
}

export default function SearchPage() {
  return <Suspense fallback={<div className="app-loading"><span className="loading-logo">e</span><p>Buscando produtos...</p></div>}><SearchContent/></Suspense>;
}
