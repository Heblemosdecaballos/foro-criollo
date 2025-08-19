// utils/http.ts
import { getPublicBaseUrl } from './base-url'

/**
 * apiFetch: construye la URL correctamente en CSR y SSR.
 * Úsalo así: apiFetch('/api/lo-que-sea')
 */
export async function apiFetch(input: string, init?: RequestInit) {
  const isAbsolute = /^https?:\/\//i.test(input)
  const url = isAbsolute ? input : `${getPublicBaseUrl()}${input}`
  return fetch(url, init)
}
