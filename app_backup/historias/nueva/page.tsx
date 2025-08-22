// app/historias/nueva/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/utils/supabase/server'
import NewStoryForm from './NewStoryForm'

export default async function NuevaHistoriaPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/auth?redirect=${encodeURIComponent('/historias/nueva')}`)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nueva historia</h1>
      <NewStoryForm />
    </div>
  )
}
