// src/app/hall/nueva/page.tsx
import NewHallForm from "./NewHallForm";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function Page({
  searchParams,
}: {
  searchParams?: { andar?: string };
}) {
  const defaultAndar = searchParams?.andar;

  const supabase = createSupabaseServer();

  // Trae slug y name de la tabla andares
  const { data: andaresRows, error } = await supabase
    .from("andares")
    .select("slug, name")
    .order("name", { ascending: true });

  const andares =
    (andaresRows || []).map((r) => ({
      slug: r.slug,
      label: r.name ?? r.slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    })) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl md:text-3xl mb-4">Nuevo Ejemplar</h1>
      <NewHallForm defaultAndar={defaultAndar} andares={andares} />
    </div>
  );
}
