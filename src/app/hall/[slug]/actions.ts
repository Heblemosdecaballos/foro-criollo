// src/app/hall/[slug]/actions.ts
// Firmas soportadas:
//   addMediaAction(formData) | addMediaAction(slug, storage_path, media_type)
//   addYoutubeAction(formData) | addYoutubeAction(slug, youtubeUrl)
//   addHallComment(formData) | addHallComment(slug, content)
//   toggleVote(formData) | toggleVote(slug) | toggleVote(profileId, slug)

export type MediaType = "image" | "video";

/* ----------------------- MEDIA (archivo en Storage) ----------------------- */
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
      media_type = /\.(mp4|mov|webm|mkv)$/i.test(storage_path) ? "video" : "image";
    }
    if (!slug || !storage_path || !media_type) {
      throw new Error("Faltan campos (slug, storage_path o media_type)");
    }
    await postMedia(slug, storage_path, media_type);
  } else {
    const slug = String(a).trim();
    const storage_path = String(b ?? "").trim();
    const media_type = c as MediaType;
    if (!slug || !storage_path || !media_type) {
      throw new Error("Faltan campos (slug, storage_path o media_type)");
    }
    await postMedia(slug, storage_path, media_type);
  }
}
async function postMedia(slug: string, storage_path: string, media_type: MediaType) {
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

/* ----------------------- MEDIA (YouTube URL externa) ---------------------- */
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

  const isYoutube = /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(
    url
  );
  if (!isYoutube) throw new Error("URL no válida de YouTube");

  await postMedia(slug, url, "video");
}

/* ------------------------------ COMENTARIOS ------------------------------- */
export async function addHallComment(fd: FormData): Promise<void>;
export async function addHallComment(slug: string, content: string): Promise<void>;
export async function addHallComment(a: FormData | string, b?: string): Promise<void> {
  let slug = "";
  let content = "";

  if (a instanceof FormData) {
    slug = String(a.get("slug") ?? a.get("hall_slug") ?? "").trim();
    content = String(a.get("content") ?? a.get("text") ?? "").trim();
  } else {
    slug = String(a).trim();
    content = String(b ?? "").trim();
  }

  if (!slug || !content) throw new Error("Faltan campos (slug o content)");

  const res = await fetch(`/api/hall/${encodeURIComponent(slug)}/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content }),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "No se pudo publicar el comentario";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
}

/* --------------------------------- VOTOS ---------------------------------- */
export type ToggleVoteResult = { ok: true; votes: number; voted?: boolean };

export async function toggleVote(fd: FormData): Promise<ToggleVoteResult>;
export async function toggleVote(slug: string): Promise<ToggleVoteResult>;
export async function toggleVote(profileId: string, slug: string): Promise<ToggleVoteResult>;
export async function toggleVote(a: FormData | string, b?: string): Promise<ToggleVoteResult> {
  // Soporta:
  // - toggleVote(formData) -> slug en "slug" o "hall_slug"
  // - toggleVote(slug)
  // - toggleVote(profileId, slug)  (profileId se ignora; la API usa auth)
  let slug = "";

  if (a instanceof FormData) {
    slug = String(a.get("slug") ?? a.get("hall_slug") ?? "").trim();
  } else if (typeof b === "string" && b) {
    // Recibimos (profileId, slug) -> tomamos "b" como slug
    slug = String(b).trim();
  } else {
    // Recibimos (slug)
    slug = String(a).trim();
  }

  if (!slug) throw new Error("Falta slug");

  const res = await fetch(`/api/hall/${encodeURIComponent(slug)}/vote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ toggle: true }),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "No se pudo votar";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }

  // Normalizamos la respuesta:
  // endpoint actual devuelve { voted, count }
  // algunos componentes esperan { ok, votes }
  const data = await res.json().catch(() => ({} as any));
  const votes = typeof data?.count === "number" ? data.count : (data?.votes ?? 0);
  const voted = typeof data?.voted === "boolean" ? data.voted : undefined;

  return { ok: true as const, votes, voted };
}
