// src/app/hall/[slug]/actions.ts
// Compatible con dos firmas:
//   addMediaAction(formData)
//   addMediaAction(slug, storage_path, media_type)

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
    // Firma: addMediaAction(formData)
    const slug =
      String(a.get("slug") ?? a.get("hall_slug") ?? "").trim();
    const storage_path =
      String(a.get("storage_path") ?? a.get("path") ?? "").trim();
    let media_type = String(a.get("media_type") ?? a.get("type") ?? "").trim() as MediaType;

    // Inferir tipo si no viene (por extensión)
    if (!media_type) {
      media_type = /\.(mp4|mov|webm|mkv)$/i.test(storage_path) ? "video" : "image";
    }

    if (!slug || !storage_path || !media_type) {
      throw new Error("Faltan campos (slug, storage_path o media_type)");
    }
    await post(slug, storage_path, media_type);
  } else {
    // Firma: addMediaAction(slug, storage_path, media_type)
    const slug = String(a).trim();
    const storage_path = String(b ?? "").trim();
    const media_type = c as MediaType;

    if (!slug || !storage_path || !media_type) {
      throw new Error("Faltan campos (slug, storage_path o media_type)");
    }
    await post(slug, storage_path, media_type);
  }
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
