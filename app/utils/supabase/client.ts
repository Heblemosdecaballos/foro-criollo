"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Cliente de Supabase para el NAVEGADOR. */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** Sincroniza cookies del servidor cuando cambie la sesión en el cliente. */
let wired = false;
if (!wired) {
  wired = true;
  supabase.auth.onAuthStateChange(async () => {
    await fetch("/auth/callback", { method: "POST" });
  });
}
