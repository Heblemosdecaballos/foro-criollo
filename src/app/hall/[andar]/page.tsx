import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ANDARES } from "@/lib/hall/types";
import { isValidAndar, publicImageUrl, andarIcon, isAdminEmail } from "@/lib/hall/utils";

export const dynamic = "force-dynamic";

async function getCoverUrl(horseId: string) {
  const supabase = supabaseServer();

  // 1) portada explícita
  let { data: fm } = await supabase
    .from("hall_media")
    .select("path, bucket")
    .eq("horse_id", horseId)
    .eq("type", "image")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2) si no hay, la imagen más reciente
  if (!fm) {
    const r = await supabase
      .from("hall_media")
      .select("path, bucket")
      .eq("horse_id", horseId)
      .eq("type", "image")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    fm = r.data || null;
  }

  return fm?.bucket === "hall-public" && fm?.path ? publicImageUrl(fm.path) : null;
}

export default async function HallByAndar({ params }: { params: { andar: string } }) {
  const andar = params.andar;
  if (!isValidAndar(andar)) notFound();

  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = isAdminEmail(user?.email);

  const { data: horses } = await supabase
    .from("hall_horses")
    .select("id, slug, name, views, votes_count")
    .eq("andar_slug", andar)
    .order("name", { ascending: true });

  const covers = await Promise.all(
    (horses || []).map(async (h) => ({ id: h.id, url: await getCoverUrl(h.id) }))
  );
  const getUrl = (id: string) => covers.find(c => c.id === id)?.url || null;
  const andarName = ANDARES.find(a => a.slug === andar)?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={andarIcon(andar)}
            width={56}
            height={56}
            alt=""
            className="h-12 w-12 object-contain"
          />
          <h1 className="font-serif text-2xl md:text-3xl">{andarName}</h1>
        </div>

        <div className="flex items-center gap-3">
          {admin && (
            <Link
              href={`/hall/nueva?andar=${andar}`}
              className="rounded-full border bg-white/70 px-4 py-2 text-sm hover:bg-white"
            >
              + Nuevo ejemplar
            </Link>
          )}
          <Link href="/hall" className="text-sm underline">
            ← Volver a Hall
          </Link>
        </div>
      </div>

      {!horses?.length ? (
        <p className="text-neutral-700">Aún no hay ejemplares en este andar.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {horses!.map(h => {
            const cover = getUrl(h.id);
            return (
              <li key={h.id} className="rounded-2xl border bg-white/80 p-4 hover:shadow-sm">
                <Link href={`/hall/${andar}/${h.slug}`}>
                  <div className="aspect-video rounded-lg bg-gray-100 mb-3 overflow-hidden">
                    {cover ? (
                      <img src={cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                        Sin portada
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs text-neutral-600 mt-1">
                    {h.views} visitas · {h.votes_count} votos
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
