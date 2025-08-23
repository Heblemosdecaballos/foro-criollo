/**
 * Construye una URL pública para un archivo en Supabase Storage.
 *
 * Soporta dos firmas:
 * 1) publicUrl(bucket, path)
 * 2) publicUrl(storagePath)                       // ej: "hall-of-fame/imagenes/foto.png"
 *
 * Ejemplos:
 *   import publicUrl, { getPublicUrl } from "@/utils/supabase/publicUrl";
 *   const a = publicUrl("hall-of-fame", "imagenes/foto.png");
 *   const b = publicUrl("hall-of-fame/imagenes/foto.png"); // también válido
 *   const c = getPublicUrl("hall-of-fame", "imagenes/foto.png");
 *   const d = getPublicUrl("hall-of-fame/imagenes/foto.png");
 */

export function publicUrl(bucket: string, path: string): string;
export function publicUrl(storagePath: string): string;
export function publicUrl(a: string, b?: string): string {
  if (!a) return "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";

  let bucket = "";
  let path = "";

  if (typeof b === "string") {
    // Forma (bucket, path)
    bucket = a;
    path = b;
  } else {
    // Forma (storagePath) -> "bucket/ruta/archivo.ext"
    const clean = String(a).replace(/^\/+/, ""); // quita "/" inicial
    const parts = clean.split("/");
    bucket = parts.shift() || "";
    path = parts.join("/");
  }

  if (!bucket || !path) return "";

  const cleanBase = supabaseUrl.replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");
  return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

// Alias con el nombre que usan tus páginas
export function getPublicUrl(a: string, b?: string): string {
  // delega a la función principal (mismas firmas)
  // @ts-expect-error – usamos la sobrecarga de arriba
  return publicUrl(a, b);
}

export default publicUrl;
