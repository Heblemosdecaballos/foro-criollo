// src/app/foro/page.tsx
import Link from "next/link";

export default async function ForoPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const [sRes, tRes] = await Promise.all([
    fetch(`${base}/api/sections`, { cache: "no-store" }),
    fetch(`${base}/api/threads`, { cache: "no-store" }),
  ]);

  const { sections } = await sRes.json();
  const { threads } = await tRes.json();

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Foro</h1>

      <div className="flex gap-2 flex-wrap">
        {sections?.map((s: any) => (
          <Link key={s.slug} className="border rounded px-3 py-1" href={`/foro/section/${s.slug}`}>
            {s.title}
          </Link>
        ))}
      </div>

      <ul className="space-y-3">
        {threads?.map((t: any) => (
          <li key={t.id} className="border rounded p-3">
            <div className="text-sm opacity-70">{t.sections?.title}</div>
            <Link href={`/threads/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
