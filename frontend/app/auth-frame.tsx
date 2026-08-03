import Image from 'next/image';
import Link from 'next/link';

export function AuthFrame({ children, mode, userName }: { children: React.ReactNode; mode: 'login' | 'register'; userName?: string }) {
  return <main className="auth-page">
    <section className="auth-showcase">
      <Image className="auth-showcase-image" src="/images/login-market-hero.png" alt="Mercado com frutas, legumes e produtos frescos" fill priority sizes="(max-width: 900px) 100vw, 45vw"/>
      <div className="auth-showcase-overlay"/>
      <div className="auth-brand"><span className="auth-brand-mark">e</span><span>E-Market</span></div>
      <div className="auth-showcase-copy"><span className="auth-copy-badge">Seu mercado online</span><h1>Seu mercado<br/>no seu conforto.</h1><p>Produtos frescos, boas ofertas e entrega na sua porta.</p><div className="auth-benefits"><span>⚡ Entrega rápida</span><span>◈ Compra segura</span><span>% Melhores ofertas</span></div></div>
    </section>
    <section className="auth-form-side">
      <div className="auth-card"><p className="auth-welcome">{mode === 'login' ? userName ? `Bem-vindo de volta, ${userName}!` : 'Bem-vindo de volta!' : 'Crie sua conta'}</p>{children}</div>
      <div className="auth-trust"><span>▣ Seguro<br/><small>Dados protegidos</small></span><span>▱ Confiável<br/><small>Entrega garantida</small></span><span>♡ Prático<br/><small>Tudo online</small></span></div>
    </section>
  </main>;
}

export function AuthFooter({ mode }: { mode: 'login' | 'register' }) {
  return <p className="auth-switch">{mode === 'login' ? <>Ainda não tem uma conta? <Link href="/cadastro">Cadastre-se</Link></> : <>Já possui uma conta? <Link href="/login">Entrar</Link></>}</p>;
}
