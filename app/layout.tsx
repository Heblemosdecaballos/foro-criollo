// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { Cinzel, Montserrat } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

export const metadata: Metadata = {
  title: 'Hablemos de Caballos',
  description: 'Foros de Hablemos de Caballos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // ✅ tipado para evitar el error “any”
}) {
  return (
    <html lang="es" className={montserrat.className}>
      {/* Usamos las variables de color definidas en globals.css */}
      <body className="antialiased bg-[var(--brand-bg)] text-[var(--brand-foreground)]">
        {children}
      </body>
    </html>
  );
}
