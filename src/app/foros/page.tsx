import { cookies } from "next/headers";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";

export default async function ForosPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n, o) => cookieStore.set({ name: n, value: "", ...o }),
      },
    }
  );

  const { data: threads } = await supabase
    .from("threads")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Foros</h1>
        <Link href="/foros/nuevo" className="px-3 py-2 rounded bg-green-600 text-white">
          + Crear Nuevo Foro
        </Link>
      </div>

      <ul className="space-y-3">
        {(threads ?? []).map((t) => (
          <li key={t.id} className="border rounded p-3 bg-white">
            <Link href={`/foros/${t.id}`} className="font-medium underline">
              {t.title}
            </Link>
            <p className="text-xs text-gray-500">
              {new Date(t.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
