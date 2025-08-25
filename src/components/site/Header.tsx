// src/components/site/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/foros", label: "Foros" },
  { href: "/noticias", label: "Noticias" },
  { href: "/historias", label: "Historias" },
  { href: "/transmisiones", label: "Transmisiones" },
  { href: "/hall", label: "Hall of Fame" },
  { href: "/chat", label: "Chat en Vivo" },
  { href: "/ayuda", label: "Ayuda" },
  { href: "/app", label: "📱 Instalar app" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-brown-700/10 bg-cream-100">
      <div className="container h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          {/* Usa tu PNG tal cual */}
          <Image src="/brand/horse.png" alt="Hablando de Caballos" width={28} height={28} />
          <span className="font-serif text-xl font-semibold">Hablando de Caballos</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 ml-6">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  active ? "border border-olive-600 text-brown-800" : "text-brown-700 hover:bg-cream-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="ui-chip ui-chip--muted">Iniciar Sesión</Link>
          <Link href="/registro" className="btn btn-olive">Registrarse</Link>
        </div>
      </div>
    </div>
  );
}
