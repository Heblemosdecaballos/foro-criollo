// app/threads/page.tsx
export const dynamic = 'force-dynamic';

export default function ThreadsSmoke() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <h1 className="text-2xl font-cinzel">SMOKE TEST LIST OK</h1>

      <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
        Esta es una prueba temporal para confirmar que la ruta /threads renderiza sin loaders.
      </p>

      <ul className="space-y-2">
        <li className="p-3 rounded-xl border" style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
          <a href="/threads/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" className="underline">Ir a hilo de prueba</a>
        </li>
      </ul>
    </main>
  );
}
