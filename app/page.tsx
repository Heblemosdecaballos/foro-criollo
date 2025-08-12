'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
};

export default function HomePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('threads')
        .select('id, title, category, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!cancelled) {
        if (error) {
          setError(error.message);
        } else {
          setThreads(data ?? []);
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-neutral-700">Últimos temas</p>
        <Link href="/new-thread" className="px-2 py-1 text-sm rounded border">
          Crear tema
        </Link>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-2">
        {threads.map((t) => (
          <li key={t.id} className="border rounded p-3">
            <Link href={`/thread/${t.id}`} className="font-medium hover:underline">
              {t.title}
            </Link>
            <div className="text-xs text-neutral-500">
              {t.category} · {new Date(t.created_at).toLocaleString()}
            </div>
          </li>
        ))}

        {!loading && !error && threads.length === 0 && (
          <li>No hay temas todavía.</li>
        )}
      </ul>
    </main>
  );
}
