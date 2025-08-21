// /utils/hall-data.ts
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function getProfileBySlug(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('hall_profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  // PGRST116 = row not found; devolvemos null para notFound()
  if (error && (error as any).code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function getViewerProfile() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}
