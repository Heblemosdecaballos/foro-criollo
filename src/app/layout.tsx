export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from "@/components/site/HeaderWrapper";
import SiteFooter from "@/components/SiteFooter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { StickyMobileBanner, InterstitialBanner } from "@/components/ads";
import { SocketProvider } from "@/components/realtime/SocketProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import MobileNavigation from "@/components/ui/MobileNavigation";
import { supabaseServer } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://hablandodecaballos.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Hablando de Caballos", template: "%s · Hablando de Caballos" },
  description: "La comunidad más grande del Caballo Criollo Colombiano. Foros, debates, noticias y recursos ecuestres.",
  keywords: ["caballos", "criollo colombiano", "equitación", "foro", "comunidad", "jinetes", "criadores"],
  authors: [{ name: "Hablando de Caballos" }],
  openGraph: { 
    type: "website", 
    url: siteUrl, 
    siteName: "Hablando de Caballos", 
    locale: "es_ES",
    title: "Hablando de Caballos - Comunidad Ecuestre",
    description: "La comunidad más grande del Caballo Criollo Colombiano",
    images: [
      {
        url: "/hero/portada.jpg",
        width: 1200,
        height: 630,
        alt: "Hablando de Caballos - Comunidad Ecuestre"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@hablandodecaballos",
    title: "Hablando de Caballos",
    description: "La comunidad más grande del Caballo Criollo Colombiano",
    images: ["/hero/portada.jpg"]
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8B4513"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Obtener información del usuario para la navegación móvil
  let user = null;
  try {
    const supabase = supabaseServer();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (error) {
    // Continuar sin usuario si hay error
    console.log("Error getting user in layout:", error);
  }

  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen bg-neutral-cream text-warm-gray-800 font-sans antialiased">
        <ErrorBoundary>
          <SocketProvider>
            <ServiceWorkerRegistration />
            
            {/* Header unificado con manejo de autenticación del lado del servidor */}
            <HeaderWrapper />
            
            {/* Contenido principal con espaciado unificado */}
            <main id="main" className="min-h-screen pb-20 md:pb-8">
              {children}
            </main>
            
            {/* Footer unificado */}
            <SiteFooter />
            
            {/* Navegación móvil unificada */}
            <MobileNavigation user={user} />
            
            {/* Banners globales */}
            <StickyMobileBanner />
            <InterstitialBanner 
              showAfterSeconds={45}
              maxShowsPerSession={2}
              autoClose={8}
            />
          </SocketProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
