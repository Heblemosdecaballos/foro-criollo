 // src/app/hall/nueva/page.tsx
import NewHallForm from "./NewHallForm";
import { createSupabaseServer } from "@/lib/supabase/server";

type AndarRow = { slug: string; name: string | null };

function labelFromSlug(slug: string): string {
  // "trocha-y-galope" -> "Trocha Y Galope"
  return slug
    .split("-")
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { andar?: string };
}) {
  const defaultAndar = searchParams?.andar;

  const supabase = createSupabaseServer();
  const { data: andaresRows } = await supabase
    .from("andares")
    .select("slug, name")
    .order("name", { ascending: true });

  const andares =
    ((andaresRows as AndarRow[] | null) || []).map((r) => ({
      slug: r.slug,
      label: r.name ?? labelFromSlug(r.slug),
    })) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl md:text-3xl mb-4">Nuevo Ejemplar</h1>
      <NewHallForm defaultAndar={defaultAndar} andares={andares} />
    </div>
  );
}
