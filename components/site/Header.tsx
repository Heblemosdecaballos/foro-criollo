// components/site/Header.tsx
import Link from 'next/link'
import { createSupabaseServerClient } from '@/utils/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <header className="w-full border-b bg-white/70 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Hablando de Caballos
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/noticias" className="px-3 py-2">Noticias</Link>
          <Link href="/historias" className="px-3 py-2">Historias</Link>
          <Link href="/foro" className="px-3 py-2">Foro</Link>
          <Link href="/historias/nueva" className="rounded bg-amber-700 text-white px-3 py-2">
            + Publicar
          </Link>

          {session ? (
            <SignOutButton />
          ) : (
            <Link href="/auth" className="px-3 py-2 border rounded">Iniciar sesión</Link>
          )}
        </div>
      </nav>
    </header>
  )
}
