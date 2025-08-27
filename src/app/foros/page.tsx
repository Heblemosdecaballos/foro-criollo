import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import ThreadCard from "./_components/ThreadCard";

type ThreadRow = {
  id: string;
  slug: string | null;
  title: string;
  content: string;
  created_at: string;
  author_id: string | null;
  views: number;
  posts_count: number;
};

export default async function ForosPage() {
  const supabase = supabaseServer();

  const { data: threads } = await supabase
    .from("threads")
    .select("id, slug, title, content, created_at, author_id, views, posts_count")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(50);

  const authorIds = Array.from(new Set((threads ?? []).map(t => t.author_id).filter(Boolean))) as string[];
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

      <ul className="grid gap-4 md:grid-cols-2">
        {(threads ?? []).map((t: ThreadRow) => (
          <ThreadCard key={t.id} thread={t} profile={profilesMap.get(t.author_id ?? "")} />
        ))}
      </ul>
    </div>
  );
}
