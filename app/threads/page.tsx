// app/threads/page.tsx
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ThreadsPage() {
  const supabase = createClient();

  const { data: threads, error } = await supabase
    .from('threads')
    .select('id, title, created_at, author_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-cinzel">Error al cargar hilos</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-cinzel">No hay hilos aún</h1>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <h1 className="text-2xl font-cinzel">Lista de hilos</h1>
      <ul className="space-y-2">
        {threads.map((thread) => (
          <li key={thread.id} className="p-3 rounded-xl border" style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
            <a href={`/threads/${thread.id}`} className="underline">
              {thread.title || 'Sin título'}
            </a>
            <div className="text-xs text-gray-500">
              {new Date(thread.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
