// app/foro/nuevo/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/utils/supabase/server'
import NewThreadForm from './NewThreadForm'

export default async function NuevoHiloPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth?redirect=/foro/nuevo')

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nuevo hilo</h1>
      <NewThreadForm />
    </div>
  )
}
