import Link from "next/link";

async function getThreads() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/threads`, { cache: "no-store" });
  return res.json();
}

export default async function ThreadsPage() {
  const threads = await getThreads();
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Hilos</h1>
      <ul className="space-y-3">
        {threads.map((t: any) => (
          <li key={t.id} className="border p-3 rounded">
            <Link href={`/threads/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
            <div className="text-sm opacity-70">{t.replies} respuestas</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
