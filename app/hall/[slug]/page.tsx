// /app/hall/[slug]/page.tsx
import VoteButton from './VoteButton';
import { supabaseServer } from '@/lib/supabase/server';

type PageProps = {
  params: { slug: string };
};

export default async function HallProfilePage({ params }: PageProps) {
  const { slug } = params;
  const supabase = supabaseServer();

  // 1) Obtener el perfil por slug
  const { data: profile, error: profileErr } = await supabase
    .from('hall_profiles')
    .select('id, title, slug, cover_url')
    .eq('slug', slug)
    .maybeSingle();

  if (profileErr || !profile) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Perfil no encontrado</h1>
        <p className="text-muted mt-2">{profileErr?.message}</p>
      </div>
    );
  }

  // 2) Contar votos actuales de ese perfil
  const { count: votesCount } = await supabase
    .from('hall_votes')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profile.id);

  const initialVotes = votesCount ?? 0;

  return (
    <div className="container py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{profile.title}</h1>
        {/* Si tienes imagen de portada: */}
        {/* {profile.cover_url ? <img src={profile.cover_url} alt={profile.title} className="mt-4 rounded" /> : null} */}
      </header>

      {/* Botón de votación */}
      <div>
        <VoteButton
          profileId={profile.id}
          slug={slug}
          initialCount={initialVotes}
        />
      </div>

      {/* Aquí sigue tu contenido (galería, comentarios, etc.) */}
    </div>
  );
}
