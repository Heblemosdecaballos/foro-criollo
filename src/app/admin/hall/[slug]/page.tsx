import { createSupabaseServer } from "@/lib/supabase/server";
import { addYouTubeAction, uploadImageAction } from "./actions";

type Props = { params: { slug: string } };

export default async function AdminHallSlugPage({ params: { slug } }: Props) {
  const supabase = createSupabaseServer();

  const { data: entry } = await supabase
    .from("hall_entries")
    .select("id, title, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!entry) {
    return <div className="p-6">No existe el Hall con slug: {slug}</div>;
  }

  // Trae media para visualización rápida
  const { data: media } = await supabase
    .from("hall_media")
    .select("id, storage_path, kind, caption, credit, created_at")
    .eq("entry_id", entry.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-2xl font-bold">Admin · {entry.title}</h1>
        <p className="text-sm text-neutral-500">Slug: {slug}</p>
      </header>

      {/* Galería básica */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media?.map((m) => {
          const isYT = m.storage_path.startsWith("youtube:");
          if (isYT) {
            const yt = m.storage_path.replace("youtube:", "");
            return (
              <div key={m.id} className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${yt}`}
                  title="YouTube video"
                  allowFullScreen
                />
              </div>
            );
          }
          // Imagen pública
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${m.storage_path}`;
          return (
            <figure key={m.id} className="overflow-hidden rounded-md border">
              <img src={url} alt={m.caption || ""} className="w-full h-auto" />
              {(m.caption || m.credit) && (
                <figcaption className="p-2 text-xs text-neutral-600">
                  {m.caption} {m.credit ? `· Crédito: ${m.credit}` : ""}
                </figcaption>
              )}
            </figure>
          );
        })}
      </section>

      {/* Comentarios (coloca tu componente real aquí) */}
      <section id="comentarios" className="space-y-2">
        <h2 className="text-xl font-semibold">Comentarios</h2>
        <div className="text-sm text-neutral-500">
          {/* Reemplaza por tu componente real de comentarios */}
          (Aquí van los comentarios del Hall)
        </div>
      </section>

      {/* === FORMULARIOS ADMIN DEBAJO DE LOS COMENTARIOS === */}
      <section id="admin-actions" className="space-y-8">
        <h2 className="text-xl font-semibold">Acciones de Administrador</h2>

        {/* Subir imagen */}
        <form
          action={async (fd) => {
            fd.set("slug", slug);
            "use server";
            const res = await uploadImageAction(fd);
            if (!res.ok) {
              return { message: res.error };
            }
          }}
          className="border rounded-lg p-4 space-y-3"
        >
          <h3 className="font-semibold">Subir imagen</h3>
          <input type="hidden" name="slug" defaultValue={slug} />
          <div className="space-y-2">
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              className="block w-full"
            />
            <input
              type="text"
              name="caption"
              placeholder="Caption (opcional)"
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              name="credit"
              placeholder="Crédito (opcional)"
              className="w-full border rounded p-2"
            />
          </div>
          <button className="px-4 py-2 rounded bg-black text-white">Subir</button>
        </form>

        {/* Agregar YouTube */}
        <form
          action={async (fd) => {
            fd.set("slug", slug);
            "use server";
            const res = await addYouTubeAction(fd);
            if (!res.ok) {
              return { message: res.error };
            }
          }}
          className="border rounded-lg p-4 space-y-3"
        >
          <h3 className="font-semibold">Agregar video YouTube</h3>
          <input type="hidden" name="slug" defaultValue={slug} />
          <div className="space-y-2">
            <input
              type="text"
              name="youtube"
              placeholder="URL o ID de YouTube"
              required
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              name="caption"
              placeholder="Caption (opcional)"
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              name="credit"
              placeholder="Crédito (opcional)"
              className="w-full border rounded p-2"
            />
          </div>
          <button className="px-4 py-2 rounded bg-black text-white">Agregar</button>
        </form>
      </section>
    </div>
  );
}
