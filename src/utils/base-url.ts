/**
 * Devuelve la URL base del sitio (server y client safe).
 * Importar como: import baseUrl from "@/utils/base-url";
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

export default BASE_URL;           // default import
export function getBaseUrl() {     // named import opcional
  return BASE_URL;
}
