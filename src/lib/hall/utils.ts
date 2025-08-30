export const ANDAR_SLUGS = [
  "trocha-y-galope",
  "trote-y-galope",
  "trocha-colombiana",
  "paso-fino-colombiano",
] as const;

export type AndarSlug = (typeof ANDAR_SLUGS)[number];

export function isValidAndar(a: string): a is AndarSlug {
  return ANDAR_SLUGS.includes(a as AndarSlug);
}

export function isAdminEmail(email?: string | null): boolean {
  const admin = process.env.HALL_ADMIN_EMAIL?.toLowerCase().trim();
  if (!admin || !email) return false;
  return email.toLowerCase().trim() === admin;
}

/** Devuelve URL pública para un path del bucket "hall-public" */
export function publicImageUrl(path: string) {
  // Next sirve /public desde la raíz, pero esto es Supabase Storage.
  // Para evitar SDK en cliente aquí devolvemos una ruta /storage que ya es pública;
  // si estás usando CDN configurado, puedes cambiarla acá:
  return `/storage/v1/object/public/hall-public/${encodeURI(path)}`;
}

/** Carpeta por andar/ejemplar */
export function storagePaths(andar: AndarSlug, horseSlug: string) {
  const base = `Hall/${andar}/${horseSlug}`;
  return {
    images: `${base}/Images`,
    videos: `${base}/Videos`,
    docs: `${base}/Docs`,
  };
}

/** Icono PNG por andar (coloca los PNG en /public/andares/) */
export function andarIcon(andar: AndarSlug) {
  // Asegúrate de crear estos archivos:
  // /public/andares/trocha-y-galope.png
  // /public/andares/trote-y-galope.png
  // /public/andares/trocha-colombiana.png
  // /public/andares/paso-fino-colombiano.png
  return `/andares/${andar}.png`;
}
