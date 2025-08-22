// /src/app/admin/hall/[slug]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { notFound } from "next/navigation";
import { addYouTubeAction, uploadImageAction } from "./actions";

type Props = { params: { slug: string } };

function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
}

export default async function AdminHallPage({ params }: Props) {
  const { slug } = params;
  const supabase = createSupabaseServer();

  const { data: entry, error: entryErr } = await supabase
    .from("hall_entries")
    .select("id, slug, title, andar")
    .eq("slug", slug)
    .maybeSingle();

  if (entryErr) throw entryErr;
  if (!entry) notFound();

  const { data: media } = await supabase
    .from("hall_media")
    .select("id, kind, storage_path, caption, credit, created_at")
    .eq("entry_id", entry.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Admin: {entry.title}</h1>
        <p className="text-sm text-neutral-600">
          Andar: {entry.andar ?? "—"} · slug: <code>{entry.slug}</code>
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Galería</h2>
        {Array.isArray(media) && media.length > 0 ? (
          <ul className="divide-y border rounded">
            {media.map((m: any) => (
              <li key={m.id} className="p-3 text-sm flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-neutral-100">{m.kind}</span>
                <span className="truncate">{m.storage_path}</span>
                {m.caption ? <span className="text-neutral-500">· {m.caption}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-600">Sin media aún.</p>
        )}
      </div>

      {/* Agregar YouTube */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Agregar video de YouTube</h2>
        <form action={addYouTubeAction} className="space-y-3">
          <input type="hidden" name="slug" value={slug} />
          <input
            name="youtube"
            required
            placeholder="URL o ID de YouTube"
            className="w-full border rounded p-2"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="caption" placeholder="Caption (opcional)" className="w-full border rounded p-2" />
            <input name="credit" placeholder="Crédito (opcional)" className="w-full border rounded p-2" />
          </div>
          <button className="px-4 py-2 rounded bg-black text-white" type="submit">
            Agregar video
          </button>
        </form>
      </div>

      {/* Subir Imagen (con encType) */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Subir imagen</h2>
        <form
          action={uploadImageAction}
          encType="multipart/form-data"
          className="space-y-3"
        >
          <input type="hidden" name="slug" value={slug} />
          <input
            type="file"
            name="file"
            required
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="w-full"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="caption" placeholder="Caption (opcional)" className="w-full border rounded p-2" />
            <input name="credit" placeholder="Crédito (opcional)" className="w-full border rounded p-2" />
          </div>
          <button className="px-4 py-2 rounded bg-black text-white" type="submit">
            Subir imagen
          </button>
        </form>
      </div>
    </div>
  );
}
