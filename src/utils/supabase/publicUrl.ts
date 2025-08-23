/**
 * Construye una URL pública para un archivo en Supabase Storage (bucket público).
 * Ejemplo:
 *   import publicUrl, { getPublicUrl } from "@/utils/supabase/publicUrl";
 *   const url = publicUrl("hall-of-fame", "imagenes/foto.png");
 *   // o:
 *   const url2 = getPublicUrl("hall-of-fame", "imagenes/foto.png");
 */
export function publicUrl(bucket: string, path: string): string {
  if (!bucket || !path) return "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";

  const cleanBase = supabaseUrl.replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");
  return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

// Alias con el nombre que usan tus páginas
export function getPublicUrl(bucket: string, path: string): string {
  return publicUrl(bucket, path);
}

export default publicUrl;
