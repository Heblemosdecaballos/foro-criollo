// /app/hall/[slug]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/utils/supabase/server';

/** Utilidad: extraer el ID de un video de YouTube desde distintos formatos de URL */
function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // https://www.youtube.com/watch?v=VIDEOID
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      // https://www.youtube.com/embed/VIDEOID
      const idx = parts.indexOf('embed');
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    }
    // https://youtu.be/VIDEOID
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '').trim();
      if (id) return id;
    }
  } catch (_) {
    // URL inválida
  }
  return null;
}

/** Comentar en un perfil del Hall */
export async function addHallComment(args: {
  profileId: string;
  slug: string;
  content: string;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('hall_comments')
    .insert({
      profile_id: args.profileId,
      author_id: user.id,
      content: args.content,
    });

  if (error) throw error;

  revalidatePath(`/hall/${args.slug}`);
  revalidatePath(`/admin/hall/${args.slug}`);
}

/** Subir imagen/video de archivo a Storage y registrar en hall_media */
export async function addMediaAction(
  ctx: { profileId: string; slug: string },
  formData: FormData
) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const file = formData.get('file') as File | null;
  const caption = (formData.get('caption') as string) || null;

  if (!file || file.size === 0) {
    throw new Error('Selecciona un archivo válido');
  }

  // Ruta dentro del bucket "hall"
  const safeName = file.name.replace(/\s+/g, '_');
  const path = `${ctx.profileId}/media/${Date.now()}-${safeName}`;

  // Sube a Storage (bucket: hall)
  const { error: upErr } = await supabase.storage
    .from('hall')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    });

  if (upErr) throw upErr;

  // Inserta en la tabla hall_media
  // Nota: usa 'file_path'. Si tu columna se llama 'path', cambia la clave a { path: path }.
  const { error: dbErr } = await supabase.from('hall_media').insert({
    profile_id: ctx.profileId,
    file_path: path,     // <-- cámbialo a 'path: path' si tu columna se llama 'path'
    caption,
    created_by: user.id,
    kind: 'image',       // por si ya agregaste la columna 'kind' (ver SQL opcional abajo)
  });

  if (dbErr) throw dbErr;

  revalidatePath(`/hall/${ctx.slug}`);
  revalidatePath(`/admin/hall/${ctx.slug}`);
  return { ok: true };
}

/** Registrar un video de YouTube en hall_media (sin subir nada a Storage) */
export async function addYoutubeAction(
  ctx: { profileId: string; slug: string },
  formData: FormData
) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const url = (formData.get('youtube_url') as string)?.trim();
  const caption = (formData.get('caption') as string) || null;

  if (!url) throw new Error('Debes pegar una URL de YouTube');

  const id = extractYouTubeId(url);
  if (!id) throw new Error('URL de YouTube no válida');

  // Miniatura estándar de YouTube
  const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  // Insertamos como "video" de origen YouTube.
  // Si NO tienes estas columnas, más abajo te dejo el SQL Opcional para agregarlas.
  const { error } = await supabase.from('hall_media').insert({
    profile_id: ctx.profileId,
    kind: 'youtube',        // <-- nueva columna opcional
    video_url: url,         // <-- nueva columna opcional
    thumbnail_url: thumb,   // <-- nueva columna opcional
    caption,
    created_by: user.id,
  });

  if (error) throw error;

  revalidatePath(`/hall/${ctx.slug}`);
  revalidatePath(`/admin/hall/${ctx.slug}`);
  return { ok: true };
}
