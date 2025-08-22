'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Mantén esta lista en sincronía con el CHECK de la tabla `threads.category`
const CATEGORIES = [
  'Aprendizaje',
  'Debate',
  'Negocios',
  'Veterinaria',
  'Entrenamiento',
  'Noticias',
  'General',
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NewThreadDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('General');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setMsg(null);

      // Validaciones básicas
      if (!title.trim()) {
        setMsg('El título es obligatorio.');
        return;
      }
      if (!CATEGORIES.includes(category)) {
        setMsg('La categoría no es válida.');
        return;
      }

      setLoading(true);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Debes iniciar sesión');

      // Insert y retornamos el id para redirigir
      const { data, error } = await supabase
        .from('threads')
        .insert({
          title: title.trim(),
          category,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Limpiamos y redirigimos al hilo recién creado
      setTitle('');
      setCategory('General');
      onClose();
      if (data?.id) {
        router.push(`/thread/${data.id}`);
      }
    } catch (e: any) {
      setMsg(e.message ?? 'Error creando el tema');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Crear tema</h2>

        {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}

        <label className="mb-2 block text-sm font-medium">Título</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2"
          placeholder="Escribe el título del tema…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <label className="mb-2 block text-sm font-medium">Categoría</label>
        <select
          className="mb-6 w-full rounded border px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
          disabled={loading}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded border px-3 py-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-60"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
