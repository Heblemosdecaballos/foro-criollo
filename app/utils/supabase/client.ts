// utils/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cliente en el navegador (usa localStorage)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cada vez que cambie el estado (signin/signout/refresh) avisamos al servidor
let wired = false;
if (!wired) {
  wired = true;
  supabase.auth.onAuthStateChange(async () => {
    // esto hace que el servidor actualice las cookies de auth
    await fetch("/auth/callback", { method: "POST" });
  });
}
