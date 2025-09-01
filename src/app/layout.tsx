export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import ErrorBoundary from "@/components/ErrorBoundary";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://hablandodecaballos.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Hablando de Caballos", template: "%s · Hablando de Caballos" },
  description: "Comunidad hispana del mundo ecuestre. Foros, debates y recursos.",
  openGraph: { type: "website", url: siteUrl, siteName: "Hablando de Caballos", locale: "es_ES" },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-site-beige text-neutral-900">
        <ErrorBoundary>
          <Header />
          <main id="main">{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
