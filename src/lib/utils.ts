
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea fechas de manera consistente
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea fechas con hora
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Trunca texto a un número específico de caracteres
 */
export function truncateText(text: string, maxLength: number): string {
  if (text?.length <= maxLength) return text;
  return text?.substring(0, maxLength).trim() + '...';
}

/**
 * Genera un slug amigable para URLs
 */
export function generateSlug(text: string): string {
  return text
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .replace(/-+/g, '-'); // Remover guiones duplicados
}

/**
 * Valida email básico
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formatea números grandes (ej: 1000 -> 1K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Obtiene initiales de un nombre
 */
export function getInitials(name: string): string {
  return name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Genera un color determinístico basado en un string
 */
export function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep function para delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ======= CATEGORÍAS DE FOROS =======
 */

export interface CategoryDef {
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES = {
  general: {
    key: 'general',
    label: 'General',
    description: 'Conversación general sobre caballos',
    icon: '💬',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  entrenamiento: {
    key: 'entrenamiento',
    label: 'Entrenamiento',
    description: 'Técnicas y métodos de entrenamiento',
    icon: '🏇',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  crianza: {
    key: 'crianza',
    label: 'Crianza',
    description: 'Reproducción y genética equina',
    icon: '🐎',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  competencias: {
    key: 'competencias',
    label: 'Competencias',
    description: 'Torneos y eventos ecuestres',
    icon: '🏆',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  salud: {
    key: 'salud',
    label: 'Salud',
    description: 'Veterinaria y cuidado equino',
    icon: '⚕️',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  andares: {
    key: 'andares',
    label: 'Andares',
    description: 'Paso fino y trocha colombiana',
    icon: '✨',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  equipamiento: {
    key: 'equipamiento',
    label: 'Equipamiento',
    description: 'Monturas y accesorios',
    icon: '🏇',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
} as const;

/**
 * Obtiene la categoría por clave
 */
export function getCategory(key?: string | null): CategoryDef | null {
  if (!key) return null;
  return CATEGORIES[key as keyof typeof CATEGORIES] || null;
}

/**
 * Obtiene el label de una categoría
 */
export function getCategoryLabel(key?: string | null): string {
  const category = getCategory(key);
  return category?.label || 'General';
}

/**
 * Obtiene todas las categorías como array
 */
export function getAllCategories(): CategoryDef[] {
  return Object.values(CATEGORIES);
}
