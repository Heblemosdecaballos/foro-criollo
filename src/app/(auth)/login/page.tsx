"use client";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    // Opción A: redirigir a la página de login de Supabase
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
      `${window.location.origin}/auth/callback`
    )}`;
    window.location.href = url;
  }, []);
  return <p>Redirigiendo a Google…</p>;
}
