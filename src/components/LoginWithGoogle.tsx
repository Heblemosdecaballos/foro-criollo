"use client";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LoginWithGoogle() {
  const login = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`, // vuelve al home en tu dominio
      },
    });
  };
  return (
    <button onClick={login} className="bg-black text-white px-4 py-2 rounded">
      Entrar con Google
    </button>
  );
}
