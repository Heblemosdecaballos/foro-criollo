// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SupabaseListener from "@/components/SupabaseListener";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "Comunidad y contenidos del Caballo Criollo Colombiano",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans bg-background text-foreground">
        <SupabaseListener />
        <Header />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
