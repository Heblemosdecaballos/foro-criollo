// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { Cinzel, Montserrat } from 'next/font/google';
import NavBar from './components/NavBar';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

export const metadata: Metadata = {
  title: 'Hablemos de Caballos',
  description: 'Foro criollo — Hablemos de Caballos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={montserrat.className}>
      <body className="antialiased bg-[var(--brand-bg)] text-[var(--brand-foreground)]">
        <NavBar />
        <div className="pt-4">{children}</div>
      </body>
    </html>
  );
}
