"use server";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
