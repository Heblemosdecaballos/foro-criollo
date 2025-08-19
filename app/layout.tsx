// app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/utils/supabase/server';
import SupabaseListener from '@/components/SupabaseListener';

export const metadata = {
  title: 'Hablando de Caballos',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServer();
  // Toca Supabase al menos una vez para que el helper sincronice cookies si hiciera falta
  await supabase.auth.getSession();

  return (
    <html lang="es">
      <body>
        {/* Mantiene client-state acorde a server-state de auth */}
        <SupabaseListener />
        {children}
      </body>
    </html>
  );
}
