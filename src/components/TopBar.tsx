"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/foro", label: "Foro" },
  { href: "/hall", label: "Hall de la Fama" },
  { href: "/en-vivo", label: "En Vivo" },
  { href: "/chat", label: "Chat" }, // 👉 acceso al chat
];

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#D7D2C7] bg-[#F8F5EC]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F5EC]/75">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-tight text-xl text-[#14110F]">
          Hablando de Caballos
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-lg px-3 py-2 border border-[#CFC8B9] text-sm"
          aria-label="Abrir menú"
        >
          Menú
        </button>

        <nav className={["md:flex md:items-center md:gap-2", open ? "block mt-3 md:mt-0" : "hidden md:block"].join(" ")}>
          {NAV.map((i) => {
            const active = pathname === i.href || pathname.startsWith(i.href + "/");
            return (
              <Link
                key={i.href}
                href={i.href}
                className={[
                  "block md:inline-block rounded-lg border px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-[#14110F] bg-white text-[#14110F]"
                    : "border-[#CFC8B9] bg-[#F8F5EC] text-[#14110F]/80 hover:bg-white",
                ].join(" ")}
              >
                {i.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
