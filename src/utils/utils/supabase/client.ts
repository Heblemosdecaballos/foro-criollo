// /utils/supabase/client.ts
import { createClient as createJsClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el NAVEGADOR.
 * Usa las variables NEXT_PUBLIC_* como corresponde en apps Next.js.
 */
export function createSupabaseBrowserClient() {
  return createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ==== Alias que distintos archivos del proyecto podrían importar ==== */
/* Mantén todos para evitar futuros "has no exported member" */

export const createSupabaseClient = createSupabaseBrowserClient;
export const createSupabaseBrowser = createSupabaseBrowserClient;            // <- el que te falta
export const createSupabaseBrowserClientReadOnly = createSupabaseBrowserClient;
export const createSupabaseBrowserReadOnly = createSupabaseBrowserClient;
