// app/hall/nueva/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import NewHallForm from './NewHallForm'

export const revalidate = 0

export default async function NewHallPage() {
  const supabase = createSupabaseServerClientReadOnly()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth?next=/hall/nueva')

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Nueva nominación</h1>
      <NewHallForm />
    </div>
  )
}
