// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/site/Header'
import { Lora, Inter } from 'next/font/google'

// Fuentes: Lora (títulos) + Inter (UI/cuerpos)
const fontSerif = Lora({ subsets: ['latin'], variable: '--font-serif', weight: ['400','500','600','700'] })
const fontSans  = Inter({ subsets: ['latin'], variable: '--font-sans', weight: ['400','500','600','700'] })

// El header lee cookies/sesión → forzamos dinámico
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Hablando de Caballos',
  description: 'Comunidad, foro e historias del Caballo Criollo Colombiano',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fontSerif.variable} ${fontSans.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
        <Header />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  )
}
