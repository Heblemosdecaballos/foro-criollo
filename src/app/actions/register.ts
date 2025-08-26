// src/app/actions/register.ts
"use server";

import { createSupabaseServer } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = createSupabaseServer();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) {
    // Redirige con query para mostrar mensaje (puedes leerlo en la página si quieres)
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  // Puedes llevar al usuario a /login con aviso o a home
  redirect("/login?registered=1");
}
