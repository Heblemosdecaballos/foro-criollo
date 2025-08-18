// components/auth/GoogleButton.tsx
'use client';

import { useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';

export default function GoogleButton({ next = '/' }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleGoogle = useCallback(async () => {
    try {
      setLoading(true);

      // SIEMPRE redirigimos a TU callback en tu dominio
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        next || '/'
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          // opcionalmente:
          // queryParams: { prompt: 'consent', access_type: 'offline' },
          // skipBrowserRedirect: false // (por defecto)
        },
      });

      if (error) {
        console.error(error);
        alert('No se pudo iniciar sesión con Google.');
        setLoading(false);
      }
      // Si no hay error, el navegador será redirigido a Google → callback
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [supabase, next]);

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="btn btn-primary w-full"
    >
      {loading ? 'Entrando…' : 'Continuar con Google'}
    </button>
  );
}
