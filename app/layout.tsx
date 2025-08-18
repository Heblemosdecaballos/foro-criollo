import type { Metadata } from 'next';
import SupabaseListener from '@/components/SupabaseListener';
import './globals.css'; // si usas Tailwind u hojas globales

export const metadata: Metadata = {
  title: 'Hablando de Caballos',
  description: 'Comunidad del Caballo Criollo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Mantiene sincronizadas las cookies httpOnly de Supabase */}
        <SupabaseListener />
        {children}
      </body>
    </html>
  );
}
