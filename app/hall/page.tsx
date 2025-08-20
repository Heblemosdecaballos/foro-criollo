/* app/hall/page.tsx */
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const GAITS: { key: string; label: string }[] = [
  { key: "trocha_galope", label: "Trocha y Galope" },
  { key: "trote_galope", label: "Trote y Galope" },
  { key: "trocha_colombia", label: "Trocha Colombia" },
  { key: "paso_fino", label: "Paso Fino Colombiano" },
];

export const revalidate = 60; // si quieres ISR

export default async function HallIndexPage() {
  const supabase = createSupabaseServerClient();

  // traemos TODO y ordenamos por título ASC
  const { data: all = [] } = await supabase
    .from("hall_profiles")
    .select("id, slug, title, year, gait, cover_url")
    .order("title", { ascending: true });

  // agrupamos por andar
  const grouped: Record<string, typeof all> = {};
  for (const g of GAITS) grouped[g.key] = [];
  for (const p of all) {
    if (!grouped[p.gait]) grouped[p.gait] = [];
    grouped[p.gait].push(p);
  }

  return (
    <div className="container py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hall de la Fama</h1>
      </div>

      {GAITS.map(({ key, label }) => (
        <section key={key} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{label}</h2>
            {/* Si quieres un link a ver todos por andar, aquí */}
          </div>

          {grouped[key]?.length ? (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {grouped[key].map((p) => (
                <li key={p.id} className="rounded-xl border overflow-hidden bg-white">
                  <Link href={`/hall/${p.slug}`}>
                    {p.cover_url ? (
                      <Image
                        src={p.cover_url}
                        alt={p.title}
                        width={1000}
                        height={700}
                        className="w-full h-auto object-contain"
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-muted/20" />
                    )}
                    <div className="p-3">
                      <h3 className="font-medium">{p.title}</h3>
                      <div className="text-xs text-muted">
                        {p.year ? p.year : ""}&nbsp;
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Sin caballos aún en este andar.</p>
          )}
        </section>
      ))}
    </div>
  );
}
