/**
 * Construye una URL pública para un archivo en Supabase Storage.
 *
 * Soporta:
 * 1) publicUrl(bucket, path)
 * 2) publicUrl(storagePath)                       // "bucket/ruta/archivo.ext"
 * 3) publicUrl("https://...")                     // devuelve tal cual (externo)
 */

function isHttp(u: string) {
  return /^https?:\/\//i.test(u);
}

export function publicUrl(bucket: string, path: string): string;
export function publicUrl(storagePathOrUrl: string): string;
export function publicUrl(a: string, b?: string): string {
  if (!a) return "";

  // Caso URL externa directa
  if (typeof b === "string") {
    if (isHttp(a)) return a;
    if (isHttp(b)) return b;
  } else {
    if (isHttp(a)) return a;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";

  let bucket = "";
  let p = "";

  if (typeof b === "string") {
    bucket = a;
    p = b;
  } else {
    const clean = String(a).replace(/^\/+/, "");
    const parts = clean.split("/");
    bucket = parts.shift() || "";
    p = parts.join("/");
  }

  if (!bucket || !p) return "";

  const cleanBase = supabaseUrl.replace(/\/+$/, "");
  const cleanPath = String(p).replace(/^\/+/, "");
  return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

// Alias con el nombre que usan tus páginas
export function getPublicUrl(a: string, b?: string): string {
  // @ts-expect-error intencional por overload
  return publicUrl(a, b);
}

export default publicUrl;
