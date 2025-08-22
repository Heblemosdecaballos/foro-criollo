// /utils/supabase/publicUrl.ts

/**
 * Convierte un storage_path en URL pública.
 * - "hall/slug/archivo.jpg" -> https://.../storage/v1/object/public/hall/slug/archivo.jpg
 * - "youtube:VIDEOID" -> https://www.youtube.com/watch?v=VIDEOID (o lo que prefieras)
 * - URLs absolutas se devuelven tal cual
 */
export function getPublicUrl(storagePath: string): string {
  if (!storagePath) return "";

  // Ya es una URL
  if (/^https?:\/\//i.test(storagePath)) return storagePath;

  // YouTube
  if (storagePath.startsWith("youtube:")) {
    const id = storagePath.split(":")[1]?.trim();
    return id ? `https://www.youtube.com/watch?v=${id}` : "";
  }

  // Ruta de Storage (bucket público)
  // Ej: "hall/slug/archivo.jpg"
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Normaliza sin slashes iniciales
  const clean = storagePath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${clean}`;
}

export default getPublicUrl;
