
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "La comunidad ecuestre más grande de habla hispana",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SupabaseProvider>
          <div className="min-h-screen bg-[#f5e9da]">
            {children}
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
