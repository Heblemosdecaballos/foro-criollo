/**
 * Construye una URL pública para un archivo en Supabase Storage (bucket público).
 *
 * Ejemplo:
 *   import publicUrl from "@/utils/supabase/publicUrl";
 *   const url = publicUrl("hall-of-fame", "imagenes/foto.png");
 */
export function publicUrl(bucket: string, path: string) {
  if (!bucket || !path) return "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";

  const cleanBase = supabaseUrl.replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");
  return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

export default publicUrl;
