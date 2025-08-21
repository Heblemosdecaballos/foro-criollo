// /utils/supabase/publicUrl.ts
import { createClient } from "./server";

/**
 * storagePath: 'hall/slug/archivo.jpg'
 */
export async function getPublicUrl(storagePath: string) {
  const supabase = createClient();
  const [bucket, ...rest] = storagePath.split("/");
  const path = rest.join("/");
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
