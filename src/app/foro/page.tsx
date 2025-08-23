// /src/app/foro/page.tsx
import Link from "next/link";
import NewThreadDialog from "@/components/foro/NewThreadDialog";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function ForoPage() {
  const supabase = supabaseServer();

  const { data: threads } = await supabase
    .from("threads")
    .select("id, title, category, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Foro</h1>
        <NewThreadDialog />
      </div>

      <ul className="divide-y divide-[#E7E2D6] rounded-xl border border-[#D7D2C7] bg-white">
        {(threads ?? []).map((t) => (
          <li key={t.id} className="p-4">
            <Link href={`/foro/${t.id}`} className="font-semibold hover:underline">
              {t.title}
            </Link>
            <div className="mt-1 text-xs text-[#14110F]/60">
              {t.category} · {new Date(t.created_at).toLocaleString()}
            </div>
          </li>
        ))}
        {!threads?.length && <li className="p-4 text-sm text-[#14110F]/70">Aún no hay hilos.</li>}
      </ul>
    </div>
  );
}
