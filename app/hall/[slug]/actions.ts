'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server'; // helper que ya tienes

/** -----------------------------------------
 * Utilidades
 * ----------------------------------------- */
function supabaseServer() {
  return createClient(cookies());
}

async function requireUser() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return { user: null as any, error: 'Debes iniciar sesión.' };
  }
  return { user: data.user, error: null as any };
}

function parseString(v: FormDataEntryValue | null | undefined) {
  return typeof v === 'string' ? v.trim() : '';
}

function parseYoutubeId(url: string) {
  const re =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
  const m = url.match(re);
  return m?.[1] ?? null;
}

// Generador de ID sin dependencias externas
function genId() {
  try {
    // Disponible en Node 16+ y Next moderno
    return (globalThis as any).crypto?.randomUUID
      ? (globalThis as any).crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/** -----------------------------------------
 * 1) Comentar en un perfil del Hall
 *    👉 usado por: HallCommentForm
 * ----------------------------------------- */
export async function addHallComment(formData: FormData) {
  const { user, error: authError } = await requireUser();
  if (authError) {
    return { ok: false, error: authError };
  }

  const supabase = supabaseServer();

  const profileId = parseString(formData.get('profileId'));
  const text = parseString(formData.get('comment'));
  const viewerName = parseString(formData.get('viewerName'));

  if (!profileId) return { ok: false, error: 'Falta el perfil.' };
  if (!text) return { ok: false, error: 'El comentario no puede estar vacío.' };

  const { error } = await supabase.from('hall_comments').insert({
    profile_id: profileId,
    user_id: user.id,
    author_name: viewerName || null,
    content: text,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** -----------------------------------------
 * 2) Subir FOTO a la galería del Hall
 *    👉 usado por: AddMediaForm
 * ----------------------------------------- */
export async function addMediaAction(formData: FormData) {
  const { user, error: authError } = await requireUser();
  if (authError) {
    return { ok: false, error: authError };
  }

  const supabase = supabaseServer();

  const profileId = parseString(formData.get('profileId'));
  const caption = parseString(formData.get('caption'));
  const file = formData.get('file') as File | null;

  if (!profileId) return { ok: false, error: 'Falta el perfil.' };
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, error: 'No se recibió el archivo.' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const objectPath = `${profileId}/media/${genId()}.${ext}`;

  const { error: upError } = await supabase.storage
    .from('hall')
    .upload(objectPath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (upError) return { ok: false, error: upError.message };

  const { error: insError } = await supabase.from('hall_media').insert({
    profile_id: profileId,
    user_id: user.id,
    kind: 'image',
    path: objectPath,
    caption: caption || null,
  });

  if (insError) {
    await supabase.storage.from('hall').remove([objectPath]);
    return { ok: false, error: insError.message };
  }

  return { ok: true };
}

/** -----------------------------------------
 * 3) Agregar VIDEO de YouTube a la galería
 *    👉 usado por: AddVideoForm
 * ----------------------------------------- */
export async function addYoutubeAction(formData: FormData) {
  const { user, error: authError } = await requireUser();
  if (authError) {
    return { ok: false, error: authError };
  }

  const supabase = supabaseServer();

  const profileId = parseString(formData.get('profileId'));
  const youtube = parseString(formData.get('youtube'));
  const caption = parseString(formData.get('caption'));

  if (!profileId) return { ok: false, error: 'Falta el perfil.' };
  if (!youtube)
    return { ok: false, error: 'Debes indicar la URL o ID de YouTube.' };

  const videoId = parseYoutubeId(youtube) || youtube;
  if (!videoId) return { ok: false, error: 'No pude reconocer la URL de YouTube.' };

  const { error } = await supabase.from('hall_media').insert({
    profile_id: profileId,
    user_id: user.id,
    kind: 'youtube',
    youtube_id: videoId,
    caption: caption || null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** -----------------------------------------
 * 4) Votar / quitar voto
 *    👉 usado por: VoteButton
 * ----------------------------------------- */
export async function toggleVote(profileId: string, slug: string) {
  const { user, error: authError } = await requireUser();
  if (authError) {
    return { ok: false, error: authError };
  }

  const supabase = supabaseServer();

  const { data: existing, error: selErr } = await supabase
    .from('hall_votes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (selErr) return { ok: false, error: selErr.message };

  if (existing?.id) {
    const { error: delErr } = await supabase
      .from('hall_votes')
      .delete()
      .eq('id', existing.id);
    if (delErr) return { ok: false, error: delErr.message };
  } else {
    const { error: insErr } = await supabase.from('hall_votes').insert({
      profile_id: profileId,
      user_id: user.id,
    });
    if (insErr) return { ok: false, error: insErr.message };
  }

  const { data: countData, error: countErr } = await supabase
    .from('hall_votes')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  if (countErr) return { ok: true, votes: null };
  return { ok: true, votes: countData?.length ?? null };
}
