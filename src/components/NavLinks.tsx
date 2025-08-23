"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/foro", label: "Foro" },
  { href: "/noticias", label: "Noticias" },
  { href: "/historias", label: "Historias" },
  { href: "/hall", label: "Hall" },
  { href: "/en-vivo", label: "En vivo" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-4">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-2 rounded-md ${active ? "bg-secondary text-secondary-foreground" : "text-foreground/80 hover:text-foreground"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
