"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/foro", label: "Foro" },
  { href: "/noticias", label: "Noticias" },
  { href: "/historias", label: "Historias" },
  { href: "/hall", label: "Hall of Fame" }, // ← renombrado
  { href: "/en-vivo", label: "En vivo" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-2">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link key={l.href} href={l.href} className={`nav-link ${active ? "active" : ""}`}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
