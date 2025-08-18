'use client';

import { supabase } from '@/lib/supabase/client';

type Props = {
  next?: string; // a dónde quieres volver después del login
  className?: string;
};

export default function GoogleLoginButton({ next = '/historias/nueva', className }: Props) {
  async function loginWithGoogle() {
    // Usa el apex del sitio (sin www) para que las cookies caigan en el host correcto
    const base =
      typeof window !== 'undefined'
        ? window.location.origin // en prod será https://hablandodecaballos.com
        : process.env.NEXT_PUBLIC_SITE_URL!;

    const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(next)}`;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // (Opcional) mejora refresh tokens en Google
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  }

  return (
    <button
      type="button"
      onClick={loginWithGoogle}
      className={className ?? 'px-4 py-2 rounded bg-emerald-600 text-white'}
      aria-label="Continuar con Google"
    >
      Continuar con Google
    </button>
  );
}
