
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = (now.getTime() - target.getTime()) / 1000

  if (diffInSeconds < 60) return 'hace un momento'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} d`
  
  return formatDate(date)
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`
}

export function formatPrice(amount: number, currency: string = 'COP'): string {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

export function calculateUserLevel(points: number): { level: number; name: string; color: string } {
  if (points >= 5000) return { level: 5, name: 'Leyenda', color: '#E6B31E' }
  if (points >= 2000) return { level: 4, name: 'Maestro', color: '#8B5CF6' }
  if (points >= 500) return { level: 3, name: 'Experto', color: '#3B82F6' }
  if (points >= 100) return { level: 2, name: 'Aficionado', color: '#10B981' }
  return { level: 1, name: 'Novato', color: '#9CA3AF' }
}

export function getNextLevelProgress(points: number): { current: number; next: number; progress: number } {
  const thresholds = [0, 100, 500, 2000, 5000]
  let currentLevel = 0
  
  for (let i = 0; i < thresholds.length; i++) {
    if (points >= thresholds[i]) {
      currentLevel = i
    } else {
      break
    }
  }
  
  if (currentLevel === thresholds.length - 1) {
    return { current: points, next: points, progress: 100 }
  }
  
  const currentThreshold = thresholds[currentLevel]
  const nextThreshold = thresholds[currentLevel + 1]
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  
  return { current: points, next: nextThreshold, progress: Math.round(progress) }
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
