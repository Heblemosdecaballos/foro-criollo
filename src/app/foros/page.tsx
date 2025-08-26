import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import ForumStats from "./_components/ForumStats";
import ThreadCard from "./_components/ThreadCard";

type ThreadRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string | null;
  views: number;
  posts_count: number;
};

export default async function ForosPage() {
  const supabase = supabaseServer();

  // 1) KPIs para la gráfica
  const { data: kpis } = await supabase.rpc("forum_kpis", { p_days: 14 });
  const stats = (kpis ?? []).map((r: any) => ({
    day: r.day,
    threads: r.threads,
    posts: r.posts,
    active_users: r.active_users,
  }));

  // 2) Hilos
  const { data: threads } = await supabase
    .from("threads")
    .select("id, title, content, created_at, author_id, views, posts_count")
    .order("created_at", { ascending: false })
    .limit(50);

  // 3) Perfiles (para mostrar nombre)
  const authorIds = Array.from(new Set((threads ?? []).map((t) => t.author_id).filter(Boolean))) as string[];
  let profilesMap = new Map<string, any>();
  if (authorIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", authorIds);

    for (const p of profiles ?? []) profilesMap.set(p.id, p);
  }

  // 4) Render
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foros</h1>
        <Link
          href="/foros/nuevo"
          className="px-3 py-2 rounded-xl bg-green-600 text-white shadow-sm hover:shadow-md transition"
        >
          + Crear Nuevo Foro
        </Link>
      </div>

      {/* KPIs / Gráfica */}
      <ForumStats data={stats} />

      {/* Lista */}
      <ul className="grid gap-4 md:grid-cols-2">
        {(threads ?? []).map((t: ThreadRow) => (
          <ThreadCard key={t.id} thread={t} profile={profilesMap.get(t.author_id ?? "")} />
        ))}
      </ul>
    </div>
  );
}
