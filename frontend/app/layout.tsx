import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from './components';
export const metadata: Metadata = { title:'E-Market | Seu mercado online', description:'Compre no mercado da sua cidade com praticidade.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) { return <html lang="pt-BR"><body><StoreProvider>{children}</StoreProvider></body></html> }
