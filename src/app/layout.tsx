// src/app/layout.tsx
import type { Metadata } from "next";
import SupabaseListener from "@/components/SupabaseListener";
import "./globals.css"; // ⬅️ ESTO ES LA CLAVE: carga Tailwind + estilos globales

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "Comunidad y contenidos de Hablando de Caballos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SupabaseListener />
        {children}
      </body>
    </html>
  );
}
