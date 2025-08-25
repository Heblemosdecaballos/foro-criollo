// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/src/components/site/Header";

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "La comunidad más grande del Caballo Criollo Colombiano",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
