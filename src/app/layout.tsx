export const dynamic = "force-static"; // layout puede ser estático

import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://hablandodecaballos.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hablando de Caballos",
    template: "%s · Hablando de Caballos",
  },
  description:
    "Comunidad hispana de aficionados y profesionales del mundo ecuestre. Foros, debates y recursos.",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Hablando de Caballos",
    locale: "es_ES",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
