// app/layout.tsx
import type { Metadata } from 'next'
import SessionListener from '@/components/auth/SessionListener'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hablando de Caballos',
  description: 'Comunidad del caballo criollo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Listener que mantiene la UI sincronizada con la sesión */}
        <SessionListener />
        {children}
      </body>
    </html>
  )
}
