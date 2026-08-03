'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, fromApiProduct } from '../../api';
import { Shell, useStore } from '../../components';
import { Product, money } from '../../store-data';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { add, favorite, favorites } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [raw, setRaw] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { api<any>(`/products/${slug}`).then((data) => { setRaw(data); setProduct(fromApiProduct(data)); }).catch((value) => setError(value.message)); }, [slug]);
  if (error) return <Shell><main className="container"><div className="panel empty-state"><h1>Produto não encontrado</h1><p>{error}</p><Link className="primary" href="/categorias">Voltar ao catálogo</Link></div></main></Shell>;
  if (!product) return <Shell><main className="container"><div className="panel product-loading">Carregando produto...</div></main></Shell>;
  return <Shell><main className="container"><header className="page-head"><span className="crumb">Início / {product.category} / {product.name}</span></header>
    <div className="product-detail"><section className="panel product-gallery"><div className="product-main-image">{product.image ? <img src={product.image} alt={product.name}/> : <span>{product.emoji}</span>}</div><div className="product-description"><h2>Sobre este produto</h2><p>{raw.description || `${product.name} selecionado para chegar em ótimas condições até sua casa.`}</p><div className="product-facts"><span><b>Marca</b>{product.brand || 'E-Market'}</span><span><b>Conteúdo</b>{product.unit}</span><span><b>Categoria</b>{product.category}</span><span><b>Estoque</b>{raw.stock} unidades</span></div></div></section>
    <aside className="panel product-buy"><span className="product-tag static">{product.tag || 'Disponível'}</span><p className="unit">{product.brand} · {product.unit}</p><h1>{product.name}</h1>{product.oldPrice && <span className="old-price">De {money(product.oldPrice)}</span>}<div className="price product-price">{money(product.price)}</div><p className="stock-note">✓ Em estoque · pronto para entrega</p><button className="primary full" onClick={() => add(product)}>Adicionar ao carrinho</button><button className="secondary full" onClick={() => favorite(product.id)}>{favorites.includes(product.id) ? '♥ Remover dos favoritos' : '♡ Adicionar aos favoritos'}</button><div className="delivery-note"><b>Entrega rápida</b><small>Informe o endereço no checkout para calcular.</small></div></aside></div>
  </main></Shell>;
}
