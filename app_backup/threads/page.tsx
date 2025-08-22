// app/threads/page.tsx
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// timeout simple
function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); })
     .catch(e => { clearTimeout(t); reject(e); });
  });
}

export default async function ThreadsPage() {
  // 1) Traer hilos (server component, sin loaders)
  let threads: any[] = [];
  try {
    const q =
      supabase
        .from('threads')
        .select('id,title,created_at,author_id')
        .order('created_at', { ascending: false });

    const res: any = await withTimeout(q as unknown as Promise<any>, 8000);
    const { data, error } = res as { data: any[]; error: any };
    if (error) throw error;
    threads = data ?? [];
  } catch (e: any) {
    const msg =
      e?.message === 'timeout'
        ? 'El servidor tardó demasiado en responder (timeout).'
        : (e?.message || 'Error cargando los hilos.');
    return screenError(msg);
  }

  // 2) Render
  if (!threads.length) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <h1 className="text-2xl font-cinzel">Hilos del foro</h1>
        <div className="p-4 rounded-xl border"
             style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
          Aún no hay hilos.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <h1 className="text-2xl font-cinzel">Hilos del foro</h1>
      <ul className="space-y-3">
        {threads.map((t) => (
          <li key={t.id}
              className="p-4 rounded-xl border"
              style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)', boxShadow:'var(--brand-shadow)' }}>
            <a href={`/threads/${t.id}`} className="underline">{t.title || 'Sin título'}</a>
            <div className="text-xs" style={{ color:'var(--brand-muted)' }}>
              {new Date(t.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

function screenError(msg: string) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <h1 className="text-2xl font-cinzel">Hilos del foro</h1>
      <div className="p-4 rounded-xl border"
           style={{ background:'#FDECEC', borderColor:'#F5B3B1', color:'#C63934' }}>
        {msg}
        <div className="text-xs mt-1" style={{ color:'#8F7B63' }}>
          Si ves “permission denied” (RLS), habilita SELECT anónimo en
          <code> threads(id,title,created_at,author_id)</code>.
        </div>
      </div>
    </main>
  );
}
