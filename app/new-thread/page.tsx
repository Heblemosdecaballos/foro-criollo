import { supabase } from '@/lib/supabaseClient'
;

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewThreadPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  if (!user) {
    return (
      <main className="min-h-screen max-w-md mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Crear tema</h1>
        <p>Necesitas iniciar sesión.</p>
        <Link className="underline" href="/login">Ir a Ingresar</Link>
      </main>
    );
  }

async function handleCreate(e: React.FormEvent) {
  e.preventDefault();

  // ✅ Garantizamos que user no sea null aquí
  if (!user) {
    setMsg('Necesitas iniciar sesión.');
    return;
  }

  setMsg(null);
  setLoading(true);

  const { error } = await supabase.from('threads').insert({
    title,
    category: category || null,
    created_by: user.id, // ahora TS sabe que user no es null
  });

  setLoading(false);
  if (error) return setMsg(error.message);

  router.push('/'); // listo
}

  return (
    <main className="min-h-screen max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Crear tema</h1>

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <form onSubmit={handleCreate} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Título del tema"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Categoría (opcional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button className="w-full border rounded p-2 font-medium" disabled={loading} type="submit">
          {loading ? 'Guardando…' : 'Publicar'}
        </button>
      </form>
    </main>
  );
}
