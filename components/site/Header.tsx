// components/site/Header.tsx
import Link from 'next/link'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import SignOutButton from './SignOutButton'

async function Header() {
  const supabase = createSupabaseServerClientReadOnly()
  const { data: { session } } = await supabase.auth.getSession()

  let displayName: string | null = null
  if (session) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', session.user.id)
      .maybeSingle()
    displayName = prof?.full_name || prof?.username || null
  }

  return (
    <header className="w-full border-b border-black/5 bg-white/70 backdrop-blur">
      <nav className="container py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">Hablando de Caballos</Link>

        <div className="flex items-center gap-3">
          <Link href="/noticias" className="px-3 py-2">Noticias</Link>
          <Link href="/historias" className="px-3 py-2">Historias</Link>
          <Link href="/foro" className="px-3 py-2">Foro</Link>
          <Link href="/hall" className="px-3 py-2">Hall de la fama</Link> {/* <-- NUEVO */}
          <Link href="/en-vivo" className="px-3 py-2">En vivo</Link>
          <Link href="/historias/nueva" className="btn btn-primary">+ Publicar</Link>

        {session ? (
          <>
            {displayName && (
              <span className="hidden md:inline text-sm text-black/70">
                Hola, <strong>{displayName}</strong>
              </span>
            )}
            <Link href="/perfil" className="btn btn-ghost">Perfil</Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/auth" className="btn btn-ghost">Iniciar sesión</Link>
        )}
        </div>
      </nav>
    </header>
  )
}

export default Header
export { Header }
