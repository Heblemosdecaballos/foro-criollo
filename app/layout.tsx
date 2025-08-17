import "./globals.css";
import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CrispChat from "../components/integrations/CrispChat";

const heading = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});
const body = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hablando de Caballos",
  description:
    "Comunidad del Caballo Criollo Colombiano: historias, foro y noticias.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${body.variable} ${heading.variable} antialiased`}>
        <SiteHeader />
        {children}
        <SiteFooter />
        <CrispChat />
      </body>
    </html>
  );
}
