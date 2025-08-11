'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ThreadPage({ params }: { params: { id: string } }) {
  const [thread, setThread] = useState<{
    id: string;
    title: string;
    category: string | null;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('threads')
        .select('id, title, category, created_at')
        .eq('id', params.id)
        .single();

      if (error) setErr(error.message);
      else setThread(data);
      setLoading(false);
    })();
  }, [params.id]);

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tema</h1>
        <Link href="/" className="underline">Volver</Link>
      </header>

      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {!loading && !err && thread && (
        <article className="space-y-2">
          <h2 className="text-xl font-semibold">{thread.title}</h2>
          <div className="text-sm text-neutral-600">
            {thread.category ? `Categoría: ${thread.category} · ` : ''}
            {new Date(thread.created_at).toLocaleString()}
          </div>
          <p className="text-neutral-700">
            (Aquí más adelante añadimos el contenido y las respuestas)
          </p>
        </article>
      )}
    </main>
  );
}
