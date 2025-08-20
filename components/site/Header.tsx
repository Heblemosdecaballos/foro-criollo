// components/site/Header.tsx
import Link from 'next/link'
import SignOutButton from './SignOutButton'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export default async function Header() {
  let isLogged = false
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    isLogged = !!session
  } catch { isLogged = false }

  return (
    <header className="w-full border-b border-black/5 bg-white/70 backdrop-blur">
      <nav className="container py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">Hablando de Caballos</Link>
        <div className="flex items-center gap-3">
          <Link href="/noticias" className="px-3 py-2">Noticias</Link>
          <Link href="/historias" className="px-3 py-2">Historias</Link>
          <Link href="/foro" className="px-3 py-2">Foro</Link>
          <Link href="/en-vivo" className="px-3 py-2">En vivo</Link>
          <Link href="/historias/nueva" className="btn btn-primary">+ Publicar</Link>
          {isLogged ? (
            <SignOutButton />
          ) : (
            <Link href="/auth" className="btn btn-ghost">Iniciar sesión</Link>
          )}
        </div>
      </nav>
    </header>
  )
}
