'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';

// Ajusta esto si en tu proyecto usas otra fábrica para el cliente:
function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
}

export async function toggleVote(formData: FormData) {
  const profileId = String(formData.get('profileId') ?? '');
  const slug = String(formData.get('slug') ?? '');

  if (!profileId || !slug) {
    return { ok: false, error: 'Campos requeridos.' };
  }

  const supabase = supabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return { ok: false, error: 'No autenticado' };

  // ¿Existe ya el voto del usuario para este perfil?
  const { data: existing, error: selErr } = await supabase
    .from('hall_votes') // <-- tu tabla de votos
    .select('id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (selErr) throw selErr;

  if (existing) {
    // Quitar voto
    const { error: delErr } = await supabase
      .from('hall_votes')
      .delete()
      .eq('id', existing.id);
    if (delErr) throw delErr;
  } else {
    // Agregar voto
    const { error: insErr } = await supabase
      .from('hall_votes')
      .insert({ profile_id: profileId, user_id: user.id });
    if (insErr) throw insErr;
  }

  // Volver a validar la página del perfil del Hall
  revalidatePath(`/hall/${slug}`);
  return { ok: true };
}
