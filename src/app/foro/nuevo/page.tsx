// app/foro/nuevo/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import NewThreadForm from './NewThreadForm'
import BackButton from '@/components/common/BackButton'

export const revalidate = 0

export default async function NewThreadPage() {
  // ⚠️ Cliente SOLO LECTURA: NO escribe cookies en el render
  const supabase = createSupabaseServerClientReadOnly()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Redirige a login y vuelve luego a /foro/nuevo
    redirect('/auth?next=/foro/nuevo')
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Nuevo hilo</h1>
        <BackButton />
      </div>

      <NewThreadForm />

      <div>
        <a href="/foro" className="link">← Volver al foro</a>
      </div>
    </div>
  )
}
