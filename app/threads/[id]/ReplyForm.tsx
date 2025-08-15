'use client';

import { useState, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ReplyForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => { sub.subscription.unsubscribe(); mounted = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const text = content.trim();
    if (!text) { setErr('Escribe un mensaje.'); return; }
    if (!user) { setErr('Debes iniciar sesión para responder.'); return; }

    setBusy(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({ thread_id: threadId, author_id: user.id, content: text });
      if (error) throw error;

      setContent('');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Error al enviar la respuesta.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {!user && (
        <div
          className="p-4 rounded-xl border"
          style={{ background:'#FFF8E1', borderColor:'#F3E1A6', color:'#7A5A2F' }}
        >
          <div className="font-medium mb-1">Debes iniciar sesión para publicar</div>
          <div className="text-sm mb-2">
            Crea una cuenta o entra para responder en el hilo.
          </div>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background:'var(--brand-primary)', color:'#fff' }}
          >
            Iniciar sesión
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          className="w-full p-3 rounded-xl border outline-none"
          placeholder="Escribe tu respuesta…"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)', color:'var(--brand-foreground)' }}
          disabled={busy || !user}
        />
        {err && (
          <div className="p-3 rounded-lg text-sm" style={{ background:'#FDECEC', border:'1px solid #F5B3B1', color:'#C63934' }}>
            {err}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={busy || !user}
            className="px-4 py-2 rounded-lg"
            style={{ background:'var(--brand-primary)', color:'#fff', opacity: (busy || !user) ? 0.6 : 1 }}
          >
            {busy ? 'Publicando…' : 'Publicar respuesta'}
          </button>
        </div>
      </form>
    </div>
  );
}
