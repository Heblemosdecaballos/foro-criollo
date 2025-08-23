// src/app/layout.tsx
import type { Metadata } from "next";
import SupabaseListener from "@/components/SupabaseListener";

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "Comunidad y contenidos de Hablando de Caballos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Refresca la UI cuando cambia la sesión de Supabase */}
        <SupabaseListener />
        {children}
      </body>
    </html>
  );
}
