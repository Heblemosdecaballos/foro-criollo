// app/threads/[id]/page.tsx
// Server Component sin loaders, con timeout y usando posts.content
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type PageProps = { params: { id: string } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// timeout genérico
function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise
      .then((v) => { clearTimeout(t); resolve(v); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

export default async function ThreadDetailPage({ params }: PageProps) {
  const threadId = params?.id;
  if (!threadId) return screenMsg('URL inválida: falta el ID del hilo.');

  // 1) Hilo
  let thread: any = null;
  try {
    const q1 =
      supabase
        .from('threads')
        .select('id,title,created_at,author_id')
        .eq('id', threadId)
        .maybeSingle();

    const res1: any = await withTimeout(q1 as unknown as Promise<any>, 8000);
    const { data, error } = res1 as { data: any; error: any };
    if (error) throw error;
    if (!data) return screenMsg('No se encontró el hilo.');
    thread = data;
  } catch (e: any) {
    if (e?.message === 'timeout') {
      return screenError('El servidor tardó demasiado en responder al cargar el hilo (timeout).');
    }
    return screenError(e?.message || 'Error cargando el hilo.');
  }

  // 2) Posts (⚠️ SOLO columnas existentes: content, no body)
  let posts: any[] = [];
  try {
    const q2 =
      supabase
        .from('posts')
        .select('id,thread_id,author_id,created_at,content')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

    const res2: any = await withTimeout(q2 as unknown as Promise<any>, 8000);
    const { data, error } = res2 as { data: any[]; error: any };
    if (error) throw error;
    posts = data ?? [];
  } catch (e: any) {
    if (e?.message === 'timeout') {
      return layout(
        thread,
        errorCard('El servidor tardó demasiado en responder al cargar las respuestas (timeout).')
      );
    }
    return layout(thread, errorCard(e?.message || 'Error cargando las respuestas.'));
  }

  // 3) Render
  return layout(
    thread,
    <ul className="space-y-3">
      {posts.map((p) => (
        <li
          key={p.id}
          className="p-4 rounded-xl border"
          style={{ background: 'var(--brand-surface)', borderColor: 'var(--brand-border)', boxShadow: 'var(--brand-shadow)' }}
        >
          <div className="text-sm mb-1" style={{ color: 'var(--brand-muted)' }}>
            @{p.author_id?.slice(0, 8) ?? 'usuario'} • {new Date(p.created_at).toLocaleString()}
          </div>
          <div className="whitespace-pre-wrap">
            {p?.content || <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>(sin contenido)</span>}
          </div>
        </li>
      ))}

      {posts.length === 0 && (
        <li
          className="p-4 rounded-xl border"
          style={{ background: 'var(--brand-surface)', borderColor: 'var(--brand-border)' }}
        >
          <span style={{ color: 'var(--brand-muted)' }}>Aún no hay respuestas en este hilo.</span>
        </li>
      )}
    </ul>
  );
}

/* ---------- helpers de UI ---------- */

function screenMsg(msg: string) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
        ← Volver a hilos
      </a>
      <div className="p-4 rounded-xl border" style={{ background: 'var(--brand-surface)', borderColor: 'var(--brand-border)' }}>
        {msg}
      </div>
    </main>
  );
}

function screenError(msg: string) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
        ← Volver a hilos
      </a>
      {errorCard(msg)}
    </main>
  );
}

function errorCard(msg: string) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{ background: '#FDECEC', borderColor: '#F5B3B1', color: '#C63934' }}
    >
      {msg}
      <div className="text-xs mt-1" style={{ color: '#8F7B63' }}>
        Si ves “permission denied”/RLS, confirma que el rol anónimo tiene permiso SELECT para
        <code> threads </code> y <code> posts </code> (solo columnas públicas).
      </div>
    </div>
  );
}

function layout(thread: any, body: React.ReactNode) {
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
      {body}
    </main>
  );
}
