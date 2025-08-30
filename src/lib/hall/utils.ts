import { ANDARES, AndarSlug } from "./types";

export function isValidAndar(slug: string): slug is AndarSlug {
  return ANDARES.some(a => a.slug === slug);
}

export function storagePaths(andar: AndarSlug, horseSlug: string) {
  const base = `Hall/${andar}/${horseSlug}`;
  return {
    images: `${base}/Images`,
    videos: `${base}/Videos`,
    docs: `${base}/Docs`,
  };
}

export function publicImageUrl(path: string) {
  // Construye URL pública con transform para thumbnails (si tu proyecto lo soporta).
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/hall-public/${encodeURI(path)}?width=1200&quality=80`;
}

export function isAdminEmail(email?: string | null) {
  const admin = process.env.HALL_ADMIN_EMAIL?.toLowerCase().trim();
  return !!email && !!admin && email.toLowerCase().trim() === admin;
}
