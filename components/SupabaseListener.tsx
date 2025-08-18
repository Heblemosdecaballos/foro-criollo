'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SupabaseListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Importante: solo sincronizamos cookies en estos eventos:
        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED'
        ) {
          await fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, session }),
          });
        }

        // NO hagas ningún fetch en SIGNED_OUT aquí, para no borrar cookies por accidente.
        // Para salir, usa la ruta /logout (más abajo).
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
