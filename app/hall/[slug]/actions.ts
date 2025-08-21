// /app/hall/[slug]/actions.ts
'use server';

import { createSupabaseServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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
