'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SessionButton from '@/components/SessionButton';

type Thread = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
};

export default function Page() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('threads')
        .select('id, title, category, created_at')
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) setErr(error.message);
      else setThreads(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hablando de Caballos</h1>
        <SessionButton />
      </header>

      <div className="flex items-center justify-between">
        <p className="text-neutral-700">Últimos temas</p>
        <Link href="/new-thread" className="px-2 py-1 text-sm rounded border">Crear tema</Link>
      </div>

      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {!loading && !err && threads.length === 0 && (
        <p>No hay temas todavía. ¡Sé el primero en crear uno!</p>
      )}

      <ul className="divide-y">
        {threads.map(t => (
          <li key={t.id} className="py-3">
            <Link href={`/thread/${t.id}`} className="font-medium underline">
              {t.title}
            </Link>
            <div className="text-xs text-neutral-600">
              {t.category ? `Categoría: ${t.category} · ` : ''}
              {new Date(t.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
