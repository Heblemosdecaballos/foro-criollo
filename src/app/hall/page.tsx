// src/app/hall/page.tsx
import Link from "next/link";
import { createSupabaseServer } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HallsIndex() {
  const supabase = createSupabaseServer();
  const { data: halls } = await supabase.from("halls").select("*").order("name", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Hall of Fame</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(halls ?? []).map((h: any) => (
          <li key={h.slug} className="border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{h.name}</div>
              <div className="text-xs text-gray-500">/{h.slug}</div>
            </div>
            <Link href={`/hall/${h.slug}`} className="px-3 py-1 rounded-lg border text-sm">Ver</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
