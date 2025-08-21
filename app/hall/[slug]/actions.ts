// /app/hall/[slug]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/utils/supabase/server';

/** Utilidad: extraer el ID de un video de YouTube desde distintos formatos */
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
  } catch (_) {}
  return null;
}

/** 1) Comentar en el perfil del Hall */
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

/** 2) Subir archivo (imagen) a Storage y registrar en hall_media */
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

  // Ruta en el bucket "hall"
  const safeName = file.name.replace(/\s+/g, '_');
  const path = `${ctx.profileId}/media/${Date.now()}-${safeName}`;

  // Subir a Storage
  const { error: upErr } = await supabase.storage
    .from('hall')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    });

  if (upErr) throw upErr;

  // Registrar en DB
  // OJO: si tu columna se llama 'path' (y no 'file_path'), cambia a { path: path }
  const { error: dbErr } = await supabase.from('hall_media').insert({
    profile_id: ctx.profileId,
    file_path: path,   // <-- usa 'path: path' si tu columna se llama así
    caption,
    created_by: user.id,
    kind: 'image',     // si ya añadiste la columna 'kind' (opcional)
  });

  if (dbErr) throw dbErr;

  revalidatePath(`/hall/${ctx.slug}`);
  revalidatePath(`/admin/hall/${ctx.slug}`);
  return { ok: true };
}

/** 3) Agregar video de YouTube al perfil (sin subir archivo) */
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

  const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  const { error } = await supabase.from('hall_media').insert({
    profile_id: ctx.profileId,
    kind: 'youtube',       // columnas opcionales recomendadas
    video_url: url,
    thumbnail_url: thumb,
    caption,
    created_by: user.id,
  });

  if (error) throw error;

  revalidatePath(`/hall/${ctx.slug}`);
  revalidatePath(`/admin/hall/${ctx.slug}`);
  return { ok: true };
}

/** 4) Votar / quitar voto sobre un perfil del Hall  */
export async function toggleVote(profileId: string, slug: string) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  // ¿Ya votó este usuario este perfil?
  const { data: existing, error: selErr } = await supabase
    .from('hall_votes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (selErr) throw
