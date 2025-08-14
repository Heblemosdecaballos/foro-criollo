// app/threads/[id]/page.tsx
// Server Component: sin hooks, sin "use client"
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // evita cache estático en prod

type PageProps = {
  params: { id: string };
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// columna de texto tolerante a esquemas diferentes
function pickText(p: any): string {
  return (
    p?.body ??
    p?.content ??
    p?.text ??
    p?.message ??
    ''
  );
}

export default async function ThreadDetailPage({ params }: PageProps) {
  const threadId = params?.id;
  if (!threadId) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
          ← Volver a hilos
        </a>
        <div className="p-4 rounded-xl border" style={{ background:'#FDECEC', borderColor:'#F5B3B1', color:'#C63934' }}>
          URL inválida: falta el ID del hilo.
        </div>
      </main>
    );
  }

  // 1) Hilo
  const { data: thread, error: e1 } = await supabase
    .from('threads')
    .select('id,title,created_at,author_id')
    .eq('id', threadId)
    .maybeSingle();

  if (e1) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
          ← Volver a hilos
        </a>
        <div className="p-4 rounded-xl border" style={{ background:'#FDECEC', borderColor:'#F5B3B1', color:'#C63934' }}>
          {e1.message || 'Error cargando el hilo.'}
        </div>
      </main>
    );
  }
  if (!thread) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
          ← Volver a hilos
        </a>
        <div className="p-4 rounded-xl border" style={{ background:'#FDECEC', borderColor:'#F5B3B1', color:'#C63934' }}>
          No se encontró el hilo.
        </div>
      </main>
    );
  }

  // 2) Posts
  const { data: posts, error: e2 } = await supabase
    .from('posts')
    .select('id,author_id,created_at,body,content,text,message')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (e2) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
          ← Volver a hilos
        </a>
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold font-cinzel">{thread.title}</h1>
          <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
            Hilo creado el {new Date(thread.created_at).toLocaleString()}
          </p>
        </header>
        <div className="p-4 rounded-xl border" style={{ background:'#FDECEC', borderColor:'#F5B3B1', color:'#C63934' }}>
          {e2.message || 'Error cargando las respuestas.'}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
        ← Volver a hilos
      </a>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold font-cinzel">{thread.title}</h1>
        <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
          Hilo creado el {new Date(thread.created_at).toLocaleString()}
        </p>
      </header>

      <ul className="space-y-3">
        {(posts ?? []).map((p: any) => (
          <li
            key={p.id}
            className="p-4 rounded-xl border"
            style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)', boxShadow:'var(--brand-shadow)' }}
          >
            <div className="text-sm mb-1" style={{ color: 'var(--brand-muted)' }}>
              @{p.author_id?.slice(0,8) ?? 'usuario'} • {new Date(p.created_at).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">
              {pickText(p) || <span className="text-sm" style={{ color:'var(--brand-muted)' }}>(sin contenido)</span>}
            </div>
          </li>
        ))}
        {(!posts || posts.length === 0) && (
          <li className="p-4 rounded-xl border"
              style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
            <span style={{ color:'var(--brand-muted)' }}>Aún no hay respuestas en este hilo.</span>
          </li>
        )}
      </ul>
    </main>
  );
}
