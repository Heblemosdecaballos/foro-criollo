// src/app/hall/[slug]/actions.ts
// Firmas soportadas:
//   addMediaAction(formData)
//   addMediaAction(slug, storage_path, media_type)
//
//   addYoutubeAction(formData)
//   addYoutubeAction(slug, youtubeUrl)

export type MediaType = "image" | "video";

export async function addMediaAction(fd: FormData): Promise<void>;
export async function addMediaAction(
  slug: string,
  storage_path: string,
  media_type: MediaType
): Promise<void>;
export async function addMediaAction(
  a: FormData | string,
  b?: string,
  c?: MediaType
): Promise<void> {
  if (a instanceof FormData) {
    const slug = String(a.get("slug") ?? a.get("hall_slug") ?? "").trim();
    const storage_path = String(a.get("storage_path") ?? a.get("path") ?? "").trim();
    let media_type = String(a.get("media_type") ?? a.get("type") ?? "").trim() as MediaType;

    if (!media_type) {
      // Inferir tipo por extensión si no viene
      media_type = /\.(mp4|mov|webm|mkv)$/i.test(storage_path) ? "video" : "image";
    }

    if (!slug || !storage_path || !media_type) {
      throw new Error("Faltan campos (slug, storage_path o media_type)");
    }
    await post(slug, storage_path, media_type);
  } else {
    const slug = String(a).trim();
    const storage_path = String(b ?? "").trim();
    const media_type = c as MediaType;

    if (!slug || !storage_path || !media_type) {
      throw new Error("Faltan campos (slug, storage_path o media_type)");
    }
    await post(slug, storage_path, media_type);
  }
}

export async function addYoutubeAction(fd: FormData): Promise<void>;
export async function addYoutubeAction(slug: string, youtubeUrl: string): Promise<void>;
export async function addYoutubeAction(a: FormData | string, b?: string): Promise<void> {
  let slug = "";
  let url = "";

  if (a instanceof FormData) {
    slug = String(a.get("slug") ?? a.get("hall_slug") ?? "").trim();
    url = String(a.get("youtube_url") ?? a.get("url") ?? "").trim();
  } else {
    slug = String(a).trim();
    url = String(b ?? "").trim();
  }

  if (!slug || !url) throw new Error("Faltan campos (slug o youtubeUrl)");

  // Validación mínima de YouTube:
  const isYoutube = /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(url);
  if (!isYoutube) throw new Error("URL no válida de YouTube");

  // Guardamos la URL externa directamente como storage_path y media_type 'video'
  await post(slug, url, "video");
}

async function post(slug: string, storage_path: string, media_type: MediaType) {
  const res = await fetch(`/api/hall/${encodeURIComponent(slug)}/media`, {
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
