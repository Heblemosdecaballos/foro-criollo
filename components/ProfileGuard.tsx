'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileGuard() {
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      setNeedsProfile(!data?.username);
    })();
  }, []);

  if (!needsProfile) return null;

  return (
    <div className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
      <p className="mb-2">
        Para participar, por favor <b>completa tu perfil</b> (elige un nombre de usuario y teléfono).
      </p>
      <Link
        href="/perfil"
        className="rounded bg-amber-400 px-3 py-1 font-medium text-black hover:bg-amber-500"
      >
        Completar perfil
      </Link>
    </div>
  );
}
