'use client';

import { createBrowserClient } from '@supabase/ssr';

export default function LoginButton() {
  const login = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const origin = window.location.origin;
    const next = window.location.pathname || '/';

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
  };

  return (
    <button
      onClick={login}
      className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
    >
      Iniciar sesión con Google
    </button>
  );
}
