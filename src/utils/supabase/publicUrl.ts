/**
 * Genera una URL pública para un archivo en Supabase Storage
 * sin necesidad de instanciar el cliente. Funciona en server y client.
 *
 * Uso:
 *   import publicUrl from "@/utils/supabase/publicUrl";
 *   const url = publicUrl("mi-bucket", "ruta/imagen.png");
 */
export function publicUrl(bucket: string, path: string) {
  if (!bucket || !path) return "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    // Si falta la env, evita romper el build y devuelve cadena vacía.
    return "";
  }

  const cleanPath = String(path).replace(/^\/+/, ""); // quita "/" inicial
  // https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

export default publicUrl;
