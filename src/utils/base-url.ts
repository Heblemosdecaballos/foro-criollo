/**
 * Devuelve la URL base pública del sitio (server y client safe).
 * Uso:
 *   import baseUrl, { getBaseUrl, getPublicBaseUrl } from "@/utils/base-url";
 */
function resolveBaseUrl(): string {
  // Cliente
  if (typeof window !== "undefined") return window.location.origin;

  // Server
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return fromEnv || "http://localhost:3000";
}

const BASE_URL = resolveBaseUrl();

export default BASE_URL;

export function getBaseUrl(): string {
  return BASE_URL;
}

// Alias con el nombre que usan tus páginas
export function getPublicBaseUrl(): string {
  return BASE_URL;
}

// (opcional) constante pública por si la prefieren como const
export const PUBLIC_BASE_URL = BASE_URL;
