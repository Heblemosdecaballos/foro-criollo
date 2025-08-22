// /src/app/layout.tsx
import "./globals.css";
import TopBar from "@/components/TopBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "Comunidad y recursos del caballo criollo colombiano",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#F8F5EC] text-[#14110F] antialiased">
        <TopBar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
