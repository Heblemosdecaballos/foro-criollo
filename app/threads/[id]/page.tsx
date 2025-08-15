// app/threads/[id]/page.tsx
// Server Component con manejo de errores y timeout
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // evita cache estático

type PageProps = { params: { id: string } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// util: tomar la columna de texto que exista
function pickText(p: any): string {
  return p?.body ?? p?.content ?? p?.text ?? p?.message ?? '';
}

// util: timeout (rechaza si tarda demasiado)
function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); })
     .catch(e => { clearTimeout(t); reject(e); });
  });
}

export default async function ThreadDetailPage({ params }: PageProps) {
  const threadId = params?.id;
  if (!threadId) {
    return screenMsg('URL inválida: falta el ID del hilo.');
  }

  // 1) Cargar hilo (con timeout)
  let thread: any = null;
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('threads')
        .select('id,title,created_at,author_id')
        .eq('id', threadId)
        .maybeSingle()
    );

    if (error) throw error;
    if (!data) return screenMsg('No se encontró el hilo.');

    thread = data;
  } catch (e: any) {
    if (e?.message === 'timeout') {
      return screenError('El servidor tardó demasiado en responder al cargar el hilo (timeout).');
    }
    return screenError(e?.message || 'Error cargando el hilo.');
  }

  // 2) Cargar posts (con timeout)
  let posts: any[] = [];
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('posts')
        .select('id,author_id,created_at,body,content,text,message')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
    );

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

  // 3) Render normal
  return layout(
    thread,
    <ul className="space-y-3">
      {posts.map((p) => (
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

      {posts.length === 0 && (
        <li
          className="p-4 rounded-xl border"
          style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}
        >
          <span style={{ color:'var(--brand-muted)' }}>Aún no hay respuestas en este hilo.</span>
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
      <div className="p-4 rounded-xl border"
           style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
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
    <div className="p-4 rounded-xl border"
         style={{ background:'#FDECEC', borderColor:'#F5B3B1', color:'#C63934' }}>
      {msg}
      <div className="text-xs mt-1" style={{ color:'#8F7B63' }}>
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
