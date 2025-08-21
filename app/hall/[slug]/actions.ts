'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server'; // ← tu helper de Supabase (ya existe en el repo)
import { v4 as uuid } from 'uuid';

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
  // soporta formatos comunes de YouTube
  const re =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
  const m = url.match(re);
  return m?.[1] ?? null;
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
  const text = parseString(formData.get('comment')); // name="comment" en el textarea
  const viewerName = parseString(formData.get('viewerName')); // opcional, si lo usas

  if (!profileId) {
    return { ok: false, error: 'Falta el perfil.' };
  }
  if (!text) {
    return { ok: false, error: 'El comentario no puede estar vacío.' };
  }

  const { error } = await supabase.from('hall_comments').insert({
    profile_id: profileId,
    user_id: user.id,
    author_name: viewerName || null, // si no lo usas, se puede quitar
    content: text,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** -----------------------------------------
 * 2) Subir FOTO a la galería del Hall
 *    👉 usado por: AddMediaForm
 *    Campos de FormData:
 *      - file (File)
 *      - profileId (string)
 *      - caption (string, opcional)
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

  if (!profileId) {
    return { ok: false, error: 'Falta el perfil.' };
  }
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, error: 'No se recibió el archivo.' };
  }

  // Ruta del archivo en el bucket "hall"
  const ext = file.name.split('.').pop() ?? 'jpg';
  const objectPath = `${profileId}/media/${uuid()}.${ext}`;

  // Subida a storage
  const { error: upError } = await supabase.storage
    .from('hall')
    .upload(objectPath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (upError) {
    return { ok: false, error: upError.message };
  }

  // Guarda registro en la tabla hall_media
  const { error: insError } = await supabase.from('hall_media').insert({
    profile_id: profileId,
    user_id: user.id,
    kind: 'image', // distinguimos tipos: 'image' | 'youtube'
    path: objectPath,
    caption: caption || null,
  });

  if (insError) {
    // si falló la inserción, intentamos borrar el archivo recién subido
    await supabase.storage.from('hall').remove([objectPath]);
    return { ok: false, error: insError.message };
  }

  return { ok: true };
}

/** -----------------------------------------
 * 3) Agregar VIDEO de YouTube a la galería
 *    👉 usado por: AddVideoForm
 *    Campos de FormData:
 *      - profileId (string)
 *      - youtube (string)  ← url o id
 *      - caption (string, opcional)
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

  if (!profileId) {
    return { ok: false, error: 'Falta el perfil.' };
  }
  if (!youtube) {
    return { ok: false, error: 'Debes indicar la URL o ID de YouTube.' };
  }

  const videoId = parseYoutubeId(youtube) || youtube; // si ya viene ID
  if (!videoId) {
    return { ok: false, error: 'No pude reconocer la URL de YouTube.' };
  }

  const { error } = await supabase.from('hall_media').insert({
    profile_id: profileId,
    user_id: user.id,
    kind: 'youtube',
    youtube_id: videoId,
    caption: caption || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** -----------------------------------------
 * 4) Votar / quitar voto
 *    👉 usado por: VoteButton
 *    Firma: toggleVote(profileId, slug)
 * ----------------------------------------- */
export async function toggleVote(profileId: string, slug: string) {
  const { user, error: authError } = await requireUser();
  if (authError) {
    return { ok: false, error: authError };
  }

  const supabase = supabaseServer();

  // ¿Ya votó este usuario a este perfil?
  const { data: existing, error: selErr } = await supabase
    .from('hall_votes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (selErr) {
    return { ok: false, error: selErr.message };
  }

  if (existing?.id) {
    // quitar el voto
    const { error: delErr } = await supabase
      .from('hall_votes')
      .delete()
      .eq('id', existing.id);

    if (delErr) {
      return { ok: false, error: delErr.message };
    }
  } else {
    // agregar voto
    const { error: insErr } = await supabase.from('hall_votes').insert({
      profile_id: profileId,
      user_id: user.id,
    });

    if (insErr) {
      return { ok: false, error: insErr.message };
    }
  }

  // retornar el nuevo total de votos (opcional)
  const { data: countData, error: countErr } = await supabase
    .from('hall_votes')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  if (countErr) {
    return { ok: true, votes: null };
  }

  return { ok: true, votes: countData?.length ?? null };
}
