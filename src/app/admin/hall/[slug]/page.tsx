// /src/app/admin/hall/[slug]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { notFound } from "next/navigation";
import { addYouTubeAction, uploadImageAction } from "./actions";

type Props = { params: { slug: string } };

/** Cliente Supabase local para Server Components (sin alias externos) */
function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function AdminHallPage({ params }: Props) {
  const { slug } = params;
  const supabase = createSupabaseServer();

  // Validar que exista la entrada
  const { data: entry, error: entryErr } = await supabase
    .from("hall_entries")
    .select("id, slug, title, andar")
    .eq("slug", slug)
    .maybeSingle();

  if (entryErr) throw entryErr;
  if (!entry) notFound();

  // Media existente
  const { data: media } = await supabase
    .from("hall_media")
    .select("id, kind, storage_path, caption, credit, created_at")
    .eq("entry_id", entry.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Admin: {entry.title}</h1>
        <p className="text-sm text-neutral-600">
          Andar: {entry.andar ?? "—"} · slug: <code>{entry.slug}</code>
        </p>
      </header>

      {/* Galería existente */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Galería</h2>
        {media && media.length > 0 ? (
          <ul className="divide-y border rounded">
            {media.map((m) => (
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
      </section>

      {/* Form: YouTube */}
      <section clas
