// utils/http.ts
import { getPublicBaseUrl } from './base-url'

/**
 * apiFetch: usa rutas relativas en cliente y absolutas en SSR sin romper CORS/redirecciones.
 *
 * Ejemplos:
 * - apiFetch('/api/posts')
 * - apiFetch('/api/auth/session', { cache: 'no-store' })
 */
export async function apiFetch(input: string, init?: RequestInit) {
  const isAbsolute = /^https?:\/\//i.test(input)
  const url = isAbsolute ? input : `${getPublicBaseUrl()}${input}`
  return fetch(url, init)
}
