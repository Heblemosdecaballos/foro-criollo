// app/historias/nueva/page.tsx
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/utils/supabase/server'

export default async function NuevaHistoriaPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/historias/nueva') // ajusta a tu ruta de login
  }

  return (
    <main className="container-page py-8">
      <h1>Nueva historia</h1>
      {/* …tu formulario real aquí… */}
    </main>
  )
}
