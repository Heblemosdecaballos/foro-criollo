"use client";
import { useEffect } from "react";
import { createSupabaseBrowser } from "@/utils/supabase/client"; // alias ya creado
import { useRouter } from "next/navigation";

export default function SupabaseListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      // al iniciar/cerrar sesión, refresca la UI
      router.refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return null;
}
