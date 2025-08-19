// utils/base-url.ts
/**
 * Devuelve el origen público correcto (apex) para construir URLs absolutas
 * sin romper si cambia el dominio o falta alguna variable.
 */
export function getPublicBaseUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL || // por si quedó en algún entorno
    ''

  if (fromEnv) return fromEnv.replace(/\/$/, '')

  // En el navegador, usa el origin actual
  if (typeof window !== 'undefined') return window.location.origin

  // Fallback seguro en SSR/Edge
  return 'https://hablandodecaballos.com'
}
