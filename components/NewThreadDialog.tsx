'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NewThreadDialog({ open, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Debes iniciar sesión');

      const { error } = await supabase.from('threads').insert({
        title,
        category,
        created_by: user.id,
      });

      if (error) throw error;
      onClose();
    } catch (e: any) {
      setMsg(e.message ?? 'Error creando el tema');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div>
      {msg && <p className="text-red-600">{msg}</p>}
      {/* …tu UI para titulo/categoría/botones… */}
      <button disabled={loading} onClick={handleCreate}>
        Publicar
      </button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
