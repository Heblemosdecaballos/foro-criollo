import Link from "next/link";
import dynamic from "next/dynamic";
import { supabaseServer } from "@/lib/supabase/server";
import ThreadCard from "./_components/ThreadCard";
import SearchAndSort from "./_components/SearchAndSort";
import Pagination from "./_components/Pagination";

const ForumStats = dynamic(() => import("./_components/ForumStats"), { ssr: false });

type ThreadRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string | null;
  views: number;
  posts_count: number;
};

const PAGE_SIZE = 10;

export default async function ForosPage({ searchParams }: { searchParams?: { q?: string; sort?: string; page?: string } }) {
  const supabase = supabaseServer();

  // KPIs para la gráfica
  const { data: kpis } = await supabase.rpc("forum_kpis", { p_days: 14 });
  const stats = (kpis ?? []).map((r: any) => ({
    day: r.day,
    threads: r.threads,
    posts: r.posts,
    active_users: r.active_users,
  }));

  // Parámetros
  const q = (searchParams?.q ?? "").trim();
  const sort = (searchParams?.sort ?? "recent").toLowerCase();
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10));

  const orderBy =
    sort === "views" ? { col: "views", asc: false } :
    sort === "active" ? { col: "posts_count", asc: false } :
    { col: "created_at", asc: false };

  // Filtro OR por título o contenido (usa índices trigram)
  const orFilter = q ? `title.ilike.%${q}%,content.ilike.%${q}%` : undefined;

  // Datos + conteo total (EXACT) + paginación
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("threads")
    .select("id, title, content, created_at, author_id, views, posts_count", { count: "exact" })
    .order(orderBy.col as any, { ascending: orderBy.asc })
    .range(from, to);

  if (orFilter) query = query.or(orFilter);

  const { data: threads, count } = await query;

  // Perfiles de autores
  const authorIds = Array.from(new Set((threads ?? []).map((t) => t.author_id).filter(Boolean))) as string[];
  const profilesMap = new Map<string, any>();
  if (authorIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", authorIds);
    for (const p of profiles ?? []) profilesMap.set(p.id, p);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foros</h1>
        <Link href="/foros/nuevo" className="px-3 py-2 rounded-xl bg-green-600 text-white shadow-sm hover:shadow-md transition">
          + Crear Nuevo Foro
        </Link>
      </div>

      {/* Búsqueda + orden */}
      <SearchAndSort />

      {/* KPIs */}
      <ForumStats data={stats} />

      {/* Lista de hilos */}
      <ul className="grid gap-4 md:grid-cols-2">
        {(threads ?? []).map((t: ThreadRow) => (
          <ThreadCard key={t.id} thread={t} profile={profilesMap.get(t.author_id ?? "")} />
        ))}
      </ul>

      {/* Paginación */}
      <Pagination total={count ?? 0} pageSize={PAGE_SIZE} />
    </div>
  );
}
