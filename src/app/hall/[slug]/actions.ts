// src/app/hall/[slug]/actions.ts
// Módulo cliente: se puede importar desde componentes con "use client".
// Envía la info del archivo subido a la API de Next para registrarlo en DB.

export type MediaType = "image" | "video";

/**
 * Registra un media ya subido a Supabase Storage en la tabla hall_media.
 * @param slug          slug del item del Hall
 * @param storage_path  "bucket/ruta/archivo.ext" (ej: "hall/slug/123-foto.jpg")
 * @param media_type    "image" | "video"
 */
export async function addMediaAction(
  slug: string,
  storage_path: string,
  media_type: MediaType
): Promise<void> {
  const res = await fetch(`/api/hall/${slug}/media`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ storage_path, media_type }),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "No se pudo registrar el archivo";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
}
