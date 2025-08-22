'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'var(--brand-surface)',
        borderBottom: '1px solid var(--brand-border)',
      }}
    >
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* IZQUIERDA: Marca */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* Si tienes un logo en /public/logo.svg, descomenta:
            <img src="/logo.svg" alt="Hablemos de Caballos" className="h-7 w-auto" /> */}
            <span className="font-cinzel text-lg" style={{ color: 'var(--brand-primary)' }}>
              Hablemos de Caballos
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm" style={{ color: 'var(--brand-muted)' }}>
            <Link href="/threads" className="hover:underline">Foro</Link>
            {/* Agrega más rutas si quieres: */}
            {/* <Link href="/transmisiones" className="hover:underline">Transmisiones</Link> */}
          </div>
        </div>

        {/* DERECHA: Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                @{user.email?.split('@')[0] ?? user.id.slice(0, 6)}
              </span>
              <button
                onClick={handleLogout}
                disabled={busy}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={{
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: 'var(--brand-primary)', color: '#fff' }}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
