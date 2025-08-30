export type AndarSlug =
  | "trocha-y-galope"
  | "trote-y-galope"
  | "trocha-colombiana"
  | "paso-fino-colombiano";

export type Andar = { slug: AndarSlug; name: string };

export const ANDARES: Andar[] = [
  { slug: "trocha-y-galope", name: "Trocha y Galope" },
  { slug: "trote-y-galope", name: "Trote y Galope" },
  { slug: "trocha-colombiana", name: "Trocha Colombiana" },
  { slug: "paso-fino-colombiano", name: "Paso Fino Colombiano" },
];

export type Horse = {
  id: string;
  slug: string;
  name: string;
  andar_slug: AndarSlug;
  description: string | null;
  pedigree_url: string | null;
  views: number;
  votes_count: number;
  created_at: string;
};

export type MediaType = "image" | "video" | "doc";

export type HallMedia = {
  id: string;
  horse_id: string;
  type: MediaType;
  bucket: "hall-originals" | "hall-public";
  path: string;
  mime_type: string | null;
  size_bytes: number | null;
  is_featured: boolean;
  created_at: string;
};
