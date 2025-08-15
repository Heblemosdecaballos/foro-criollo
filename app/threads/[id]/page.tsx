// app/threads/[id]/page.tsx (SMOKE TEST)
export const dynamic = 'force-dynamic';

export default function ThreadDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
        ← Volver a hilos
      </a>
      <div className="p-4 rounded-xl border"
           style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
        <div className="font-cinzel text-xl">SMOKE TEST OK</div>
        <div>ID del hilo: <b>{params.id}</b></div>
      </div>
    </main>
  );
}
