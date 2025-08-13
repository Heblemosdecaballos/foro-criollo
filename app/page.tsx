'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type ThreadRow = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  author_id: string | null;
  author_username: string | null; // viene de v_threads
};

export default function HomePage() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);
      const { data, error } = await supabase
        .from('v_threads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        setMsg(error.message);
      } else {
        setThreads(data ?? []);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Últimos temas</h1>
        <Link href="/new-thread" className="px-3 py-2 text-sm rounded border">
          Crear tema
        </Link>
      </div>

      {loading && <p>Cargando temas…</p>}
      {msg && <p className="text-red-600">{msg}</p>}

      <ul className="space-y-3">
        {threads.map((t) => (
          <li key={t.id} className="border rounded p-3">
            <div className="text-sm text-neutral-500 mb-1">
              @{t.author_username ?? 'usuario'} · {new Date(t.created_at).toLocaleString()} ·{' '}
              <span className="inline-block px-2 py-0.5 rounded bg-neutral-100">{t.category ?? 'General'}</span>
            </div>
            <Link href={`/thread/${t.id}`} className="text-lg font-medium underline">
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
