"use client";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LoginWithGoogle() {
  const onClick = async () => {
    const supa = createSupabaseBrowserClient();
    await supa.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
  };
  return <button onClick={onClick} className="px-3 py-2 border rounded">Google</button>;
}
