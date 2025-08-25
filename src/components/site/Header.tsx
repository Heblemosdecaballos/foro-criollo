// src/components/site/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
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
    <header className="w-full sticky top-0 z-40 bg-cream-50/90 backdrop-blur border-b border-brown-700/10">
      <div className="container h-16 flex items-center gap-3">
        {/* Logo marca + símbolo caballo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative inline-flex items-center justify-center">
            {/* símbolo caballo exacto (PNG sin fondo) */}
            <Image
              src="/brand/horse.png"
              alt="Símbolo Caballo"
              width={28}
              height={28}
              className="block"
              priority
            />
          </div>
          <span className="font-serif text-lg md:text-xl font-semibold leading-none text-brown-700">
            Hablando de Caballos
          </span>
        </Link>

        {/* Navegación */}
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "px-3 py-2 rounded-lg text-sm transition",
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
