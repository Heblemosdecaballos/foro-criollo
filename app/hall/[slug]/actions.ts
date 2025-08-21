'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ————————————————————————————————————————
// Utilidad: extraer el ID de un video de YouTube
function extractYouTubeId(input: string): string | null {
  try {
    const url = new URL(input);

    // youtu.be/VIDEOID
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }

    // youtube.com/watch?v=VIDEOID
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v) return v;

      // youtube.com/shorts/VIDEOID
      const parts = url.pathname.split('/');
      const sIdx = parts.indexOf('shorts');
      if (sIdx >= 0 && parts[sIdx + 1]) return parts[sIdx + 1];

      // youtube.com/embed/VIDEOID
      const eIdx = parts.indexOf('embed');
      if (eIdx >= 0 && parts[eIdx + 1]) return parts[eIdx + 1];
    }
  } catch {
    // no es URL completa, intentemos regex
  }

  const m = input.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[^0-9A-Za-z_-]|$)/);
  return m?.[1] ?? null;
}

// ————————————————————————————————————————
// ACCIÓN: agregar video de YouTube a la galería del perfil del Hall
export async function addYoutubeAction(formData: FormData) {
  const profileId = String(formData.get('profileId') || '');
  const slug = String(formData.get('slug') || '');
  const url = String(formData.get('url') || '');
  const caption = String(formData.get('caption') || '');

  if (!profileId || !slug || !url) {
    return { ok: false, error: 'Faltan datos del formulario.' };
  }

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return { ok: false, error: 'URL de YouTube inválida.' };
  }

  const supabase = createClient();

  // Guardamos el video en la tabla hall_media
  // Ajusta los nombres de columna si tu tabla usa otros (p. ej. external_url).
  const { error } = await supabase.from('hall_media').insert({
    profile_id: profileId,
    media_type: 'video',           // 👈 importante para distinguir de imagen
    storage_path: `youtube:${videoId}`, // 👈 guardamos el ID con un prefijo
    caption,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Revalidamos la vista pública y, si la tienes, la de admin
  revalidatePath(`/hall/${slug}`);
  revalidatePath(`/admin/hall/${slug}`);

  return { ok: true };
}
