"use client";

import Link from "next/link";

export default function NewThreadButton() {
  return (
    <Link
      href="/foro/nuevo"
      className="inline-flex items-center rounded-lg border border-[#14110F] bg-white px-3 py-2 text-sm font-medium hover:bg-[#14110F] hover:text-white"
    >
      Nuevo Foro
    </Link>
  );
}
