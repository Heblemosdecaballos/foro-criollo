'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ReplyForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const text = content.trim();
    if (!text) {
      setErr('Escribe un mensaje.');
      return;
    }

    setBusy(true);
    try {
      // Usuario actual (requiere sesión iniciada)
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData?.user?.id;

      if (!userId) {
        setErr('Debes iniciar sesión para responder.');
        setBusy(false);
        return;
      }

      // Insertar la respuesta
      const { error: insertErr } = await supabase
        .from('posts')
        .insert({
          thread_id: threadId,
          author_id: userId,
          content: text,        // ⚠️ usamos la columna real 'content'
        });

      if (insertErr) throw insertErr;

      setContent('');
      // volver a cargar servidor para ver la nueva respuesta
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Error al enviar la respuesta.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="w-full p-3 rounded-xl border outline-none"
        placeholder="Escribe tu respuesta…"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          background: 'var(--brand-surface)',
          borderColor: 'var(--brand-border)',
          color: 'var(--brand-foreground)',
        }}
        disabled={busy}
      />
      {err && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{ background: '#FDECEC', border: '1px solid #F5B3B1', color: '#C63934' }}
        >
          {err}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded-lg"
          style={{
            background: 'var(--brand-primary)',
            color: 'white',
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Publicando…' : 'Publicar respuesta'}
        </button>
        <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>
          Debes estar autenticado para publicar.
        </span>
      </div>
    </form>
  );
}
