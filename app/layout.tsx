import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foro Criollo Colombiano',
  description: 'Foros abiertos día a día sobre el Caballo Criollo Colombiano',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  )
}
