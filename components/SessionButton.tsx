'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  className?: string;
};

export default function SessionButton({ className = '' }: Props) {
  const [email, setEmail] = useState<string>('');
  const [user, setUser] = useState<null | { email?: string }>(null);

  useEffect(() => {
    // Estado inicial
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    // Suscripción a cambios
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription.unsubscribe();
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` },
    });
    if (error) {
      alert(error.message);
      return;
    }
    alert('Te enviamos un enlace de acceso a tu correo.');
    setEmail('');
  };

  if (user) {
    return (
      <div className={className}>
        <span className="mr-3 text-sm">{user.email}</span>
        <button
          className="rounded bg-neutral-900 px-3 py-1 text-white"
          onClick={() => supabase.auth.signOut()}
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleMagicLink} className={className}>
      <input
        className="rounded border px-3 py-1"
        type="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="ml-2 rounded bg-blue-600 px-3 py-1 text-white" type="submit">
        Enviar enlace
      </button>
      <Link href="/login" className="ml-3 underline">
        Ir al login
      </Link>
    </form>
  );
}
