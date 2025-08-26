import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ForosPage() {
  const supabase = supabaseServer();

  const { data: threads, error } = await supabase
    .from("threads")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  // (opcional) podrías mostrar un error de carga en UI si 'error'
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Foros</h1>
        <Link
          href="/foros/nuevo"
          className="px-3 py-2 rounded bg-green-600 text-white"
        >
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
