// src/constants/forums.ts

// Categorías oficiales para los foros
export const categories = [
  "Crianza y genética",
  "Entrenamiento",
  "Ferias",
  "Salud y veterinaria",
  "Historia y tradición",
  "Comercialización",
  "Experiencias",
  "Eventos en vivo",
] as const;

export type ForumCategory = (typeof categories)[number];

// Helper opcional para validar categorías
export function isForumCategory(v: string): v is ForumCategory {
  return (categories as readonly string[]).includes(v);
}

// También lo exportamos por defecto por si en alguna parte usan default import
export default categories;
