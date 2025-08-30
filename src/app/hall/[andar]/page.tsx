import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ANDARES } from "@/lib/hall/types";
import { isValidAndar } from "@/lib/hall/utils";

export const dynamic = "force-dynamic";

export default async function HallByAndar({ params }: { params: { andar: string } }) {
  const andar = params.andar;
  if (!isValidAndar(andar)) notFound();

  const supabase = supabaseServer();
  const { data: horses } = await supabase
    .from("horses")
    .select("id, slug, name, views, votes_count")
    .eq("andar_slug", andar)
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl md:text-3xl">
          {ANDARES.find(a => a.slug === andar)?.name}
        </h1>
        <Link href="/hall" className="text-sm underline">← Volver a Hall</Link>
      </div>

      {!horses?.length ? (
        <p className="text-neutral-700">Aún no hay ejemplares en este andar.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {horses!.map(h => (
            <li key={h.id} className="rounded-2xl border bg-white/80 p-4 hover:shadow-sm">
              <Link href={`/hall/${andar}/${h.slug}`}>
                <div className="aspect-video rounded-lg bg-gray-100 mb-3 flex items-center justify-center text-sm text-gray-500">
                  {/* Portada: usaremos la primera imagen featured si existe (se resuelve en detalle) */}
                  Portada
                </div>
                <div className="font-semibold">{h.name}</div>
                <div className="text-xs text-neutral-600 mt-1">{h.views} visitas · {h.votes_count} votos</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
