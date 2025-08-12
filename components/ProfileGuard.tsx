'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

/**
 * Muestra un aviso si el usuario ha iniciado sesión pero NO tiene username en profiles.
 * Si no hay sesión, no estorba (renderiza null).
 */
export default function ProfileGuard() {
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return; // visitante: no pedir perfil

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        // Silencioso: no bloquear UI por esto
        return;
      }

      if (alive && (!data || !data.username)) {
        setNeedsProfile(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!needsProfile) return null;

  return (
    <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
      <p className="mb-2">
        Para participar, por favor completa tu perfil (elige un nombre de usuario).
      </p>
      <Link href="/settings" className="underline">
        Ir a mis ajustes
      </Link>
    </div>
  );
}
