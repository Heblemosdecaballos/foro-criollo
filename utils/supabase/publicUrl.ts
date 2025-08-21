// utils/supabase/publicUrl.ts
import { createClient } from '@/utils/supabase/server';

/**
 * Devuelve la URL pública de un archivo en el bucket "hall".
 * @param path Ruta interna en el bucket (ej: 'media/abc/123.jpg')
 */
export async function getPublicUrl(path: string) {
  const supabase = createClient();
  const { data } = supabase.storage.from('hall').getPublicUrl(path);
  return data.publicUrl;
}
