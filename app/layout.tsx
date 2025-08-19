// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/site/Header'

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
