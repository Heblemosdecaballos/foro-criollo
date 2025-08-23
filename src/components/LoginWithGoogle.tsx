"use client";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LoginWithGoogle() {
  const login = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // vuelve a tu callback y luego a "/"
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
  };
  return (
    <button onClick={login} className="bg-black text-white px-4 py-2 rounded">
      Entrar con Google
    </button>
  );
}
