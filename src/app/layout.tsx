// /src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "Comunidad ecuestre — Hablando de Caballos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-[#F8F5EC] text-[#14110F] antialiased">
        <TopBar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
