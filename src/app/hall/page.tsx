import Link from "next/link";
import { ANDARES } from "@/lib/hall/types";

export const dynamic = "force-dynamic";

export default async function HallIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-2xl md:text-3xl mb-4">Hall of Fame</h1>
      <p className="text-neutral-700 mb-6">
        Descubre los ejemplares que han hecho grande el caballo criollo colombiano.
      </p>

      <div className="flex flex-wrap gap-3">
        {ANDARES.map((a) => (
          <Link
            key={a.slug}
            href={`/hall/${a.slug}`}
            className="rounded-xl border bg-white/70 px-4 py-2 hover:bg-white"
          >
            {a.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
