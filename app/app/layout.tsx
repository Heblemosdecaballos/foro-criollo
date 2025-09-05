
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/components/providers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { SessionSync } from "@/components/auth/session-sync"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description: "La comunidad ecuestre más grande de habla hispana. Hall of Fame, foros de discusión y más.",
  keywords: ["caballos", "ecuestre", "foro", "hall of fame", "criollo", "paso fino"],
  authors: [{ name: "Hablando de Caballos" }],
  openGraph: {
    title: "Hablando de Caballos",
    description: "La comunidad ecuestre más grande de habla hispana",
    type: "website",
    locale: "es_ES",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SupabaseProvider>
          <SessionSync />
          <div className="relative min-h-screen bg-background">
            <Header />
            <main className="pb-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
