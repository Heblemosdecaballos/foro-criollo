// src/components/site/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/foros", label: "Foros" },
  { href: "/noticias", label: "Noticias" },
  { href: "/historias", label: "Historias" },
  { href: "/transmisiones", label: "Transmisiones" },
  { href: "/hall", label: "Hall of Fame" },
  { href: "/chat", label: "Chat en Vivo" },
  { href: "/app", label: "📱 Instalar app" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-brown-700/10">
      <div className="container h-16 flex items-center gap-4">
        {/* LOGO (símbolo + marca) */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/brand/horse.png"         // <— Asegúrate del archivo en /public/brand/horse.png
            alt="Caballo"
            width={28}
            height={28}
            priority
          />
          <span className="font-serif text-[18px] md:text-[20px] leading-none font-semibold text-brown-700">
            Hablando de Caballos
          </span>
        </Link>

        {/* NAV (no se monta sobre la franja, tipografía algo menor) */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "px-3 py-2 rounded-lg text-[14px] transition",
                  active
                    ? "bg-cream-200 text-brown-800 border border-brown-700/10"
                    : "text-brown-700 hover:bg-cream-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA sesión */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-brown-700/20 px-4 py-1.5 text-sm text-brown-700 hover:bg-cream-100"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-lg px-4 py-2 text-sm font-medium bg-olive-600 text-white hover:bg-olive-700"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
