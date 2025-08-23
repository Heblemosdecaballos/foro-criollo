// src/app/hall/[slug]/page.tsx
import { getPublicUrl } from "@/utils/supabase/publicUrl";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export default async function HallDetail({ params }: { params: { slug: string } }) {
  const supa = createSupabaseServerClientReadOnly();
  const base = `${process.env.NEXT_PUBLIC_SITE_URL}/api/hall/${params.slug}`;

  const res = await fetch(base, { cache: "no-store" });
  if (!res.ok) return <p className="p-6">No encontrado</p>;
  const { item, media, comments } = await res.json();

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{item.title}</h1>
        {item.description && <p className="opacity-80 mt-2">{item.description}</p>}
      </header>

      {/* Media */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media?.map((m: any) => {
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
        })}
        {!media?.length && <p className="opacity-70">Sin media aún.</p>}
      </section>

      {/* Comentarios */}
      <Comments slug={params.slug} existing={comments} />
    </main>
  );
}

function Comments({ slug, existing }: { slug: string; existing: any[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium">Comentarios</h2>
      <CommentForm slug={slug} />
      <ul className="space-y-3">
        {existing?.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <div className="text-sm opacity-60">{new Date(c.created_at).toLocaleString()}</div>
            <div>{c.content}</div>
          </li>
        ))}
        {!existing?.length && <p className="opacity-70">Sé el primero en comentar.</p>}
      </ul>
    </section>
  );
}

function CommentForm({ slug }: { slug: string }) {
  async function submit(formData: FormData) {
    "use server";
    const content = String(formData.get("content") || "");
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/hall/${slug}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
      cache: "no-store",
    });
  }

  return (
    <form action={submit} className="flex gap-2">
      <input
        name="content"
        className="flex-1 border rounded px-3 py-2"
        placeholder="Escribe un comentario…"
        required
      />
      <button className="bg-black text-white px-4 rounded">Publicar</button>
    </form>
  );
}
