// src/lib/utils.ts

/** Merge de clases Tailwind */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Catálogo de categorías (claves y estilo) */
export type CategoryKey =
  | "general"
  | "crianza"
  | "entrenamiento"
  | "competencias"
  | "salud"
  | "historia"
  | "comercial";

export type CategoryDef = {
  key: CategoryKey;
  label: string;
  slug: string;
  emoji?: string;
  /** clases Tailwind para badge/pill */
  className?: string;
};

/** Orden sugerido para listados y filtros */
export const CATEGORY_ORDER: CategoryKey[] = [
  "general",
  "crianza",
  "entrenamiento",
  "competencias",
  "salud",
  "historia",
  "comercial",
];

/** Mapa de categorías usadas en foros / tags / filtros */
export const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  general: {
    key: "general",
    label: "General",
    slug: "general",
    emoji: "💬",
    className: "bg-cream-200 text-brown-800",
  },
  crianza: {
    key: "crianza",
    label: "Crianza y Genética",
    slug: "crianza",
    emoji: "🧬",
    className: "bg-cream-200 text-brown-800",
  },
  entrenamiento: {
    key: "entrenamiento",
    label: "Entrenamiento",
    slug: "entrenamiento",
    emoji: "🐎",
    className: "bg-cream-200 text-brown-800",
  },
  competencias: {
    key: "competencias",
    label: "Competencias",
    slug: "competencias",
    emoji: "🏆",
    className: "bg-cream-200 text-brown-800",
  },
  salud: {
    key: "salud",
    label: "Salud Veterinaria",
    slug: "salud",
    emoji: "🩺",
    className: "bg-cream-200 text-brown-800",
  },
  historia: {
    key: "historia",
    label: "Historia y Tradición",
    slug: "historia",
    emoji: "📜",
    className: "bg-cream-200 text-brown-800",
  },
  comercial: {
    key: "comercial",
    label: "Comercialización",
    slug: "comercial",
    emoji: "💰",
    className: "bg-cream-200 text-brown-800",
  },
};

/** Devuelve la definición de categoría desde key o slug */
export function getCategory(input?: string | null): CategoryDef | null {
  if (!input) return null;
  const key = input.toLowerCase() as CategoryKey;
  if (CATEGORIES[key]) return CATEGORIES[key];
  const found = (Object.values(CATEGORIES) as CategoryDef[]).find(
    (c) => c.slug === input.toLowerCase()
  );
  return found ?? null;
}

/** Etiqueta (con emoji) lista para UI */
export function getCategoryLabel(input?: string | null): string {
  const c = getCategory(input);
  return c ? `${c.emoji ?? ""} ${c.label}`.trim() : "General";
}
