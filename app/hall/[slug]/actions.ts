// /app/hall/[slug]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/utils/supabase/server';

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
}

/** Subir imagen/video a Storage y registrar en hall_media */
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

  // Registra la fila en la tabla hall_media
  // (si tu columna se llama "path" en vez de "file_path", cambia la clave)
  const row: any = {
    profile_id: ctx.profileId,
    file_path: path, // <-- cambia a path: path si tu columna se llama "path"
    caption,
    created_by: user.id,
  };

  const { error: dbErr } = await supabase.from('hall_media').insert(row);
  if (dbErr) throw dbErr;

  // Refresca la página pública y (si la usas) la del admin
  revalidatePath(`/hall/${ctx.slug}`);
  revalidatePath(`/admin/hall/${ctx.slug}`);
  return { ok: true };
}
