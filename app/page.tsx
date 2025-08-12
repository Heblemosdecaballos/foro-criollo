// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import ProfileGuard from '@/components/ProfileGuard';

type Author = {
  username: string | null;
  phone: string | null;
};

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author: Author | null; // alias del join
};

export default function HomePage() {
  const [rows, setRows] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // 👇 Aquí está el "paso 4": select con join a profiles usando la FK
      const { data, error } = await supabase
        .from('threads')
        .select(`
          id, title, category, created_at,
          author:profiles!threads_created_by_profiles_fk ( username, phone )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) setError(error.message);
      else setRows((data ?? []) as Thread[]);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Aviso para completar perfil */}
      <ProfileGuard />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Últimos temas</h1>
        <Link
          href="/new-thread"
          className="rounded border px-3 py-1 text-sm hover:bg-neutral-50"
        >
          Crear tema
        </Link>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <p className="text-neutral-500">Todavía no hay temas. ¡Crea el primero!</p>
      )}

      <ul className="space-y-3">
        {rows.map((t) => (
          <li key={t.id} className="rounded border p-3">
            <Link href={`/thread/${t.id}`} className="font-medium hover:underline">
              {t.title}
            </Link>
            <div className="mt-1 text-sm text-neutral-600">
              {t.author?.username ? `por ${t.author.username}` : 'por anónimo'} · {t.category}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
