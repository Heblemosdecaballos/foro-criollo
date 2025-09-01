import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { ANDARES } from "@/lib/hall/types";
import { isValidAndar, publicImageUrl, isAdminEmail } from "@/lib/hall/utils";
import { VoteButton, CommentForm, MediaComments, AdminMediaActions } from "./ui";

export const dynamic = "force-dynamic";

export default async function HorseDetail({ params }: { params: { andar: string; horse: string } }) {
  const andar = params.andar;
  if (!isValidAndar(andar)) notFound();

  const supabase = supabaseServer();

  const { data: horse } = await supabase
    .from("hall_horses").select("*")
    .eq("andar_slug", andar).eq("slug", params.horse).single();
  if (!horse) notFound();

  // Incrementar vistas
  await supabase
    .from("hall_horses")
    .update({ views: horse.views + 1 })
    .eq("id", horse.id);

  const { data: media } = await supabase
    .from("hall_media").select("*")
    .eq("horse_id", horse.id).order("created_at", { ascending: false }).limit(100);

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const andarName = ANDARES.find(a => a.slug === andar)?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href={`/hall/${andar}`} className="text-sm underline">← {andarName}</Link>
          <h1 className="font-serif text-2xl md:text-3xl">{horse.name}</h1>
          <div className="text-xs text-neutral-600">{horse.views} visitas · {horse.votes_count} votos</div>
        </div>
        <div className="flex items-center gap-2">
          <VoteButton horseId={horse.id} />
        </div>
      </div>

      {(horse.description || horse.pedigree_url) && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="md:col-span-2 rounded-2xl border bg-white/80 p-5">
            <h2 className="font-serif text-lg mb-2">Descripción</h2>
            <div className="whitespace-pre-wrap">{horse.description}</div>
          </article>
          <aside className="rounded-2xl border bg-white/80 p-5">
            <h3 className="font-serif text-lg mb-2">Pedigrí</h3>
            {horse.pedigree_url ? (
              <a href={horse.pedigree_url} target="_blank" className="underline text-sm">Ver Pedigrí</a>
            ) : (
              <p className="text-sm text-neutral-700">Sin archivo</p>
            )}
          </aside>
        </div>
      )}

      <section className="mb-8">
        <h2 className="font-serif text-xl mb-3">Galería</h2>
        {!media?.length ? (
          <p className="text-neutral-700">Aún no hay media para este ejemplar.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {media!.map(m => {
              const isImg = m.type === "image";
              const isVid = m.type === "video";
              const isDoc = m.type === "doc";
              const publicUrl = m.bucket === "hall-public" ? publicImageUrl(m.path) : null;

              return (
                <li key={m.id} className="rounded-xl border bg-white/80 p-3">
                  {isImg && publicUrl && (<img src={publicUrl} alt="" className="w-full h-auto rounded-lg" />)}
                  {isVid && (
                    <video className="w-full rounded-lg" controls preload="metadata">
                      <source src={publicUrl ?? "#"} type={m.mime_type ?? "video/mp4"} />
                    </video>
                  )}
                  {isDoc && (<a className="underline" href={publicUrl ?? "#"} target="_blank">Ver documento</a>)}

                  {isAdmin && <AdminMediaActions horseId={horse.id} mediaId={m.id} />}
                  <MediaComments mediaId={m.id} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {isAdmin && (
        <section className="mb-8">
          <h2 className="font-serif text-xl mb-3">Subir Media</h2>
          <p className="text-gray-600">Funcionalidad de subida próximamente disponible.</p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="font-serif text-xl mb-3">Comentarios</h2>
        <CommentForm targetType="horse" targetId={horse.id} />
      </section>
    </div>
  );
}
