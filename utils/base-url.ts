// utils/base-url.ts
export function getPublicBaseUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    ''

  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (typeof window !== 'undefined') return window.location.origin
  return 'https://hablandodecaballos.com'
}
