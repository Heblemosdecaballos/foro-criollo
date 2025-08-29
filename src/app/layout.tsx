export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import { Merriweather } from "next/font/google";

const heading = Merriweather({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-heading",
});

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
    <html lang="es" className={heading.variable}>
      <body className="min-h-screen bg-site-beige text-neutral-900">
        <Header />

        {/* Marca solo la portada para dibujar la franja café y aplicar el layout del héroe */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  function apply(){
    if (location && (location.pathname === "/" || location.pathname === "/inicio")) {
      document.body.classList.add("has-hero");
    } else {
      document.body.classList.remove("has-hero");
    }
  }
  document.addEventListener("DOMContentLoaded", apply);
  window.addEventListener("popstate", apply);
})();`,
          }}
        />

        <main id="main" className="site-main min-h-[calc(100vh-var(--header-h,64px))]">
          {children}
        </main>
      </body>
    </html>
  );
}
