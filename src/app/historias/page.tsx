import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import StoryCard, { Story } from "../../components/stories/StoryCard";
import Pagination from "../../components/ui/Pagination";
import Link from "next/link";

const PAGE_SIZE = 12;

function mapRow(row: any): Story {
  // mapeo flexible por si tus campos están en español
  return {
    id: row.id,
    title: row.title ?? row.titulo ?? null,
    text: row.text ?? row.contenido ?? null,
    media: row.media ?? row.medios ?? null,
    created_at: row.created_at ?? row.fecha ?? null,
    author: row.author ?? row.perfil ?? {
      name: row.author_name ?? row.autor_nombre ?? null,
      avatar_url: row.author_avatar ?? row.autor_avatar ?? null,
    },
  };
}

async function fetchStories(page: number, q?: string) {
  const c = cookies();
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => c.get(n)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // 1) intenta 'stories'
  let query = supa
    .from("stories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,text.ilike.%${q}%`);
  }

  let { data, count, error } = await query;

  // 2) fallback a 'historias' si 'stories' falla (tabla diferente)
  if (error) {
    let q2 = supa
      .from("historias")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (q) q2 = q2.or(`titulo.ilike.%${q}%,contenido.ilike.%${q}%`);
    const r2 = await q2;
    data = r2.data as any[];
    count = r2.count ?? 0;
  }

  const stories: Story[] = (data ?? []).map(mapRow);
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return { stories, pageCount };
}

export default async function HistoriasPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const q = (searchParams.q ?? "").trim() || undefined;

  const { stories, pageCount } = await fetchStories(page, q);

  return (
    <main className="container-page py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1>Historias</h1>
        <div className="flex items-center gap-2">
          <form action="/historias" className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar historias…"
              className="rounded-xl border px-3 py-2"
            />
            <input type="hidden" name="page" value="1" />
            <button className="btn-outline">Buscar</button>
          </form>
          <Link href="/historias/nueva" className="btn-accent">+ Publicar</Link>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="card p-8 text-center text-black/70 dark:text-white/70">
          No hay historias todavía.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/historias"
        q={q}
      />
    </main>
  );
}
