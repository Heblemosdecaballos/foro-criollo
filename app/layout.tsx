// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/site/Header'

// 👉 Fuerza render dinámico porque el Header lee cookies/sesión
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Hablando de Caballos',
  description: 'Comunidad, foro e historias del Caballo Criollo Colombiano',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#fbf9f1] text-[#1b1b1b]">
        <Header />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  )
}
