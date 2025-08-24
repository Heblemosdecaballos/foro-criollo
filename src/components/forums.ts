// src/constants/forums.ts
export const categories = [
  "Crianza y genética",
  "Entrenamiento",
  "Competencias",
  "Salud y veterinaria",
  "Historia y tradición",
  "Comercialización",
  "Experiencias",
  "Eventos en vivo",
] as const;

export type ForumCategory = typeof categories[number];
