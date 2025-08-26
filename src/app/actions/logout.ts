// src/app/actions/logout.ts
"use server";
import { createSupabaseServer } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
