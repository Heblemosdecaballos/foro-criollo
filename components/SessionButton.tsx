'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SessionButton({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setEmail(null);
    location.href = '/';
  }

  if (!email) return <Link href="/login" className={`underline ${className}`}>Ingresar</Link>;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-neutral-600">{email}</span>
      <Link href="/new-thread" className="px-2 py-1 text-sm rounded border">Crear tema</Link>
      <button onClick={signOut} className="text-sm underline">Salir</button>
    </div>
  );
}
