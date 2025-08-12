'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  username: string | null;
  phone: string | null;
};

export default function ProfileGuard() {
  const [needsProfile, setNeedsProfile] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        // No logueado → no mostramos banner
        if (!user) {
          if (mounted) {
            setNeedsProfile(false);
            setChecking(false);
          }
          return;
        }

        // Traemos perfil
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, phone')
          .eq('id', user.id)
          .maybeSingle<Profile>();

        if (error) throw error;

        const missing =
          !data ||
          !data.username ||
          (data.username ?? '').trim().length === 0 ||
          !data.phone ||
          (data.phone ?? '').trim().length === 0;

        if (mounted) {
          setNeedsProfile(missing);
          setChecking(false);
        }
      } catch {
        if (mounted) {
          setNeedsProfile(false);
          setChecking(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking || !needsProfile) return null;

  return (
    <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <p>
          Para participar, por favor <b>completa tu perfil</b> (elige un nombre de usuario y teléfono).
        </p>
        <Link
          href="/profile"
          className="rounded bg-amber-400 px-3 py-1 text-sm font-semibold text-amber-900 hover:bg-amber-500"
        >
          Completar perfil
        </Link>
      </div>
    </div>
  );
}
