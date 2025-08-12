// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Author = { username: string | null };

type ThreadRow = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  // Lo que devuelve PostgREST puede ser objeto, array u nulo según el embed
  author: Author | Author[] | null;
};

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author: Author | null; // Lo normalizamos a un solo autor
};

// Toma el primer autor si viene como array; si es objeto lo deja tal cual
function pickAuthor(a: ThreadRow['author']): Author | null {
  if (!a) return null;
  return Array.isArray(a) ? a[0] ?? null : a;
}

export default function HomePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    (async () => {
      setMsg(null);

      // (Opcional) Chequear si el perfil está completo para mostrar el banner
      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('username, phone')
          .eq('id', userRes.user.id)
          .maybeSingle();

        setProfileIncomplete(!prof?.username || !prof?.phone);
      }

      // Cargar hilos con el autor embebido
      const { data, error } = await supabase
        .from('threads')
        .select(`
          id,
          title,
          category,
          created_at,
          author:profiles!threads_created_by_profiles_fk ( username )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        setMsg(error.message);
        return;
      }

      const mapped = (data as ThreadRow[]).map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        created_at: r.created_at,
        author: pickAuthor(r.author),
      }));

      setThreads(mapped);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      {profileIncomplete && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          Para participar, por favor completa tu perfil.{' '}
          <Link href="/perfil" className="font-medium underline">
            Completar perfil
          </Link>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Últimos temas</h1>
        <Link href="/new-thread" className="rounded border px-2 py-1 text-sm">
          Crear tema
        </Link>
      </div>

      {msg && <p className="mb-3 text-red-600">{msg}</p>}

      <ul className="space-y-3">
        {threads.map((t) => (
          <li key={t.id} className="rounded border p-3">
            <Link href={`/thread/${t.id}`} className="font-medium underline">
              {t.title}
            </Link>
            <div className="mt-1 text-sm text-neutral-600">
              {t.author?.username ?? 'anónimo'} · {t.category}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
