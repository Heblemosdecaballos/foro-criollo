'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/utils/supabase/client';

export default function NewStoryForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // 1) Asegúrate de que el usuario está logueado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorMsg(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // 2) Inserta la historia (ajusta el nombre de la tabla/columnas a tu esquema)
    const { error: insertError } = await supabase.from('stories').insert({
      title,
      body,
      author_id: user.id,
      // published: true, // si tu tabla lo requiere
    });

    if (insertError) {
      setErrorMsg(insertError.message);
      setLoading(false);
      return;
    }

    // 3) Redirige donde corresponda
    router.push('/historias'); // o a la historia recién creada
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block mb-1 font-medium">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Texto</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded border px-3 py-2 h-48"
          required
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Publicando…' : 'Publicar'}
      </button>
    </form>
  );
}
