/**
 * Devuelve la URL base del sitio (seguro en server y client).
 * Uso: import baseUrl from "@/utils/base-url";
 */
function resolveBaseUrl() {
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
export function getBaseUrl() {
  return BASE_URL;
}
