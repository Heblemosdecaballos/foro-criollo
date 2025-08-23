// src/app/hall/[slug]/page.tsx
import { getPublicUrl } from "@/utils/supabase/publicUrl";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";
import HallCommentForm from "@/components/HallCommentForm";

export const dynamic = "force-dynamic";

export default async function HallDetail({ params }: { params: { slug: string } }) {
  const supa = createSupabaseServerClientReadOnly();

  // Puedes seguir usando tu API interna si prefieres:
  // const base = `${process.env.NEXT_PUBLIC_SITE_URL}/api/hall/${params.slug}`;
  // const res = await fetch(base, { cache: "no-store" });
  // const { item, media, comments } = res.ok ? await res.json() : { item: null, media: [], comments: [] };

  // O traer directo desde Supabase (read-only):
  const { data: item } = await supa.from("hall_items").select("*").eq("slug", params.slug).single();
  if (!item) return <p className="p-6">No encontrado</p>;

  const [{ data: media }, { data: comments }] = await Promise.all([
    supa.from("hall_media").select("*").eq("hall_id", item.id).order("created_at", { ascending: false }),
    supa.from("hall_comments").select("*").eq("hall_id", item.id).order("created_at", { ascending: false }),
  ]);

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{item.title}</h1>
        {item.description && <p className="opacity-80 mt-2">{item.description}</p>}
      </header>

      {/* Media */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media?.length ? media.map((m: any) => {
          const url = getPublicUrl(m.storage_path); // acepta "bucket/path"
          return (
            <div key={m.id} className="border rounded-lg overflow-hidden">
              {m.media_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="w-full h-auto" />
              ) : (
                <video src={url} controls className="w-full h-auto" />
              )}
            </div>
          );
        }) : <p className="opacity-70">Sin media aún.</p>}
      </section>

      {/* Comentarios */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Comentarios</h2>
        <HallCommentForm slug={params.slug} />
        <ul className="space-y-3">
          {comments?.length ? comments.map((c: any) => (
            <li key={c.id} className="border rounded p-3">
              <div className="text-sm opacity-60">
                {new Date(c.created_at).toLocaleString()}
              </div>
              <div>{c.content}</div>
            </li>
          )) : <p className="opacity-70">Sé el primero en comentar.</p>}
        </ul>
      </section>
    </main>
  );
}
