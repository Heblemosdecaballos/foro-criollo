// /app/admin/hall/[slug]/page.tsx

import { notFound } from 'next/navigation';
import HallCommentForm from './HallCommentForm';
import { getProfileBySlug, getViewerProfile } from '@/utils/hall-data'; // ajusta si tu helper está en otra ruta

type PageProps = {
  params: { slug: string };
};

export default async function AdminHallProfilePage({ params }: PageProps) {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) return notFound();

  // Tu helper que obtiene el perfil del usuario logeado:
  const viewerProfile = await getViewerProfile();

  return (
    <main className="container py-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{profile.title}</h1>
        <p className="text-sm text-muted">{profile.gait?.toUpperCase()} · {profile.year ?? '-'}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Comentarios</h2>

        {/* ✅ AQUÍ ESTÁ EL CAMBIO CLAVE: viewerName SIEMPRE ES string */}
        <HallCommentForm
          profileId={profile.id}
          viewerName={viewerProfile?.name ?? ''} 
        />
      </section>

      {/* ...si tienes más secciones (galería, detalles, etc.) déjalas igual */}
    </main>
  );
}
