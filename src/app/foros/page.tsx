import Link from "next/link";
import dynamic from "next/dynamic";
import { supabaseServer } from "@/lib/supabase/server";
import ThreadCard from "./_components/ThreadCard";

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

export default async function ForosPage({ searchParams }: { searchParams?: { sort?: string } }) {
  const supabase = supabaseServer();

  // KPIs para gráfica
  const { data: kpis } = await supabase.rpc("forum_kpis", { p_days: 14 });
  const stats = (kpis ?? []).map((r: any) => ({
    day: r.day,
    threads: r.threads,
    posts: r.posts,
    active_users: r.active_users,
  }));

  // Orden por querystring
  const sort = (searchParams?.sort ?? "recent").toLowerCase();
  const orderBy =
    sort === "views" ? { col: "views", asc: false } :
    sort === "active" ? { col: "posts_count", asc: false } :
    { col: "created_at", asc: false };

  // Hilos y perfiles
  const { data: threads } = await supabase
    .from("threads")
    .select("id, title, content, created_at, author_id, views, posts_count")
    .order(orderBy.col as any, { ascending: orderBy.asc })
    .limit(50);

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

      <div className="flex items-center gap-2 text-sm">
        <Link href="/foros?sort=recent" className="px-3 py-1 rounded-full border hover:bg-gray-50">Recientes</Link>
        <Link href="/foros?sort=views"  className="px-3 py-1 rounded-full border hover:bg-gray-50">Populares</Link>
        <Link href="/foros?sort=active" className="px-3 py-1 rounded-full border hover:bg-gray-50">Activos</Link>
      </div>

      <ForumStats data={stats} />

      <ul className="grid gap-4 md:grid-cols-2">
        {(threads ?? []).map((t: ThreadRow) => (
          <ThreadCard key={t.id} thread={t} profile={profilesMap.get(t.author_id ?? "")} />
        ))}
      </ul>
    </div>
  );
}
