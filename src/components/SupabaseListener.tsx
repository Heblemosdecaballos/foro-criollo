"use client";
import { useEffect } from "react";
import { createSupabaseBrowser } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SupabaseListener() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => router.refresh());
    return () => sub.subscription.unsubscribe();
  }, [router]);
  return null;
}
