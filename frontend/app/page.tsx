"use client";

import { useEffect } from "react";

export default function SplashPage() {
  useEffect(() => {
    const timeout = window.setTimeout(
      () => window.location.replace("/login"),
      3_000,
    );
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      <meta httpEquiv="refresh" content="4;url=/login" />
      <main className="splash" aria-label="Carregando E-Market">
        <div className="splash-glow" />
        <div className="splash-content">
          <div className="splash-logo">e</div>
          <h1>E-Market</h1>
          <p>Seu mercado, no seu conforto.</p>
          <div className="splash-loader" aria-hidden="true">
            <span />
          </div>
        </div>
      </main>
    </>
  );
}
