import type { Metadata } from "next";
import "./globals.css";
import "./components.css";
import "./storefront.css";
import "./design-system.css";
import { StoreProvider } from "./components";
export const metadata: Metadata = {
  title: "E-Market",
  description:
    "Mercado online com catálogo, carrinho e acompanhamento de pedidos.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{document.documentElement.dataset.theme=localStorage.getItem("emarket-dark")==="true"?"dark":"light"}catch{}',
          }}
        />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
