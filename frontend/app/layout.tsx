import type { Metadata } from "next";
import "./globals.css";
import "./components.css";
import "./storefront.css";
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
    <html lang="pt-BR">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
