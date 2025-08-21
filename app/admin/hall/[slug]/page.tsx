// app/admin/hall/[slug]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { getPublicUrl } from '@/utils/supabase/publicUrl';

type MediaRow = {
  id: string;
  media_type: 'image' | 'video';
  storage_path: string;
  caption: string | null;
};

type Profile = {
  id: string;
  slug: string;
  title: string;
  gait: string | null;
  year: number | null;
  status: string;
};

export const revalidate = 0;

async function getProfileBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hall_profiles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

async function getMedia(profileId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hall_media')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MediaRow[];
}

export default async function AdminHallProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-bold">Editor del Hall</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No se encontró el perfil.
        </p>
      </main>
    );
  }

  const media = await getMedia(profile.id);

  return (
    <main className="container py-8 space-y-8">
      {/* Encabezado Admin */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Editor del Hall</h1>
        <p className="text-sm text-muted-foreground">
          Editando: <span className="font-medium">{profile.title}</span>
        </p>
      </header>

      {/* ====== GALERÍA (Imágenes + Videos YouTube) ====== */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Medios</h2>

        {media.length > 0 ? (
          <ul className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {await Promise.all(
              media.map(async (m) => {
                if (m.media_type === 'image') {
                  const url = await getPublicUrl(m.storage_path);
                  return (
                    <li key={m.id} className="rounded-xl overflow-hidden">
                      <img
                        src={url}
                        alt={m.caption ?? ''}
                        className="w-full h-auto object-contain bg-[#f6f3ee]"
                        loading="lazy"
                      />
                      {m.caption && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          {m.caption}
                        </p>
                      )}
                    </li>
                  );
                }

                if (
                  m.media_type === 'video' &&
                  typeof m.storage_path === 'string' &&
                  m.storage_path.startsWith('youtube:')
                ) {
                  const youtubeId = m.storage_path.split(':')[1];
                  return (
                    <li key={m.id} className="rounded-xl overflow-hidden">
                      <div className="aspect-video w-full">
                        <iframe
                          className="w-full h-full rounded-xl"
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      {m.caption && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          {m.caption}
                        </p>
                      )}
                    </li>
                  );
                }

                return null;
              })
            )}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aún no hay archivos.</p>
        )}
      </section>

      {/* Aquí debajo puedes dejar tus formularios de admin (subir imagen, agregar video, etc.) */}
      {/* <AddMediaForm profileId={profile.id} /> */}
      {/* <AddVideoForm profileId={profile.id} /> */}
      {/* ... */}
    </main>
  );
}
