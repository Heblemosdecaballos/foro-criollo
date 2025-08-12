'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileGuard() {
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, phone')
        .eq('id', user.id)                 // <<--- usar id, NO user_id
        .maybeSingle();

      if (active) {
        // necesita perfil si falta username o phone
        setNeedsProfile(!!error || !data?.username || !data?.phone);
      }
    })();

    return () => { active = false; };
  }, []);

  if (!needsProfile) return null;

  return (
    <div className="mb-6 rounded-md border border-amber-400 bg-amber-50 p-3 text-sm">
      Para participar, por favor completa tu perfil (elige un nombre de usuario y teléfono).
      <Link href="/profile" className="ml-3 rounded bg-amber-400 px-3 py-1 text-black">
        Completar perfil
      </Link>
    </div>
  );
}
