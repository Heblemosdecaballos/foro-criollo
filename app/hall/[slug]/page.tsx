// /app/hall/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProfileBySlug, getViewerProfile } from '@/utils/hall-data';
import HallCommentForm from './HallCommentForm';
import AddMediaForm from './AddMediaForm'; // si lo usas para subir archivos

type Params = { slug: string };

export default async function HallProfilePage({ params }: { params: Params }) {
  const { slug } = params;

  const profile = await getProfileBySlug(slug);
  if (!profile) return notFound();

  const viewer = await getViewerProfile();

  return (
    <div className="container py-8 space-y-8">
      {/* Encabezado */}
      <header className="space-y-1">
        <p className="text-xs uppercase text-muted">
          {profile.gait?.toUpperCase()} · {profile.year ?? '—'}
        </p>
        <h1 className="text-3xl font-bold">{profile.title}</h1>
      </header>

      {/* Comentarios */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Comentarios</h2>
        <HallCommentForm
          profileId={profile.id}
          slug={slug}
          viewerName={viewer?.name ?? null}
        />
      </section>

      {/* Subir archivos (debajo de comentarios) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Subir archivos</h2>
        <AddMediaForm profileId={profile.id} slug={slug} />
      </section>
    </div>
  );
}
