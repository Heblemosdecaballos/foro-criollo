// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/src/components/site/Header";

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "La comunidad más grande del Caballo Criollo Colombiano",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {/* Header con server-side auth */}
        <Header />
        {children}
      </body>
    </html>
  );
}
