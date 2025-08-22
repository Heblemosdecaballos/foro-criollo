// utils/http.ts
import { getPublicBaseUrl } from './base-url'
export async function apiFetch(input: string, init?: RequestInit) {
  const isAbsolute = /^https?:\/\//i.test(input)
  const url = isAbsolute ? input : `${getPublicBaseUrl()}${input}`
  return fetch(url, init)
}
