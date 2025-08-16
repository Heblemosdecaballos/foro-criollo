// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CrispChat from "../components/integrations/CrispChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "Foro, historias y comunidad del Caballo Criollo Colombiano"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SiteHeader />
        {children}
        <SiteFooter />
        <CrispChat />
      </body>
    </html>
  );
}
