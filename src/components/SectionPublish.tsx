// /src/components/SectionPublish.tsx
"use client";

import Link from "next/link";

export default function SectionPublish({
  href,
  label = "Publicar",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg border border-[#14110F] bg-white px-3 py-2 text-sm font-medium hover:bg-[#14110F] hover:text-white"
    >
      {label}
    </Link>
  );
}
