// app/perfil/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import ProfileForm from './ProfileForm'
import BackButton from '@/components/common/BackButton'

export const revalidate = 0

export default async function PerfilPage() {
  const supabase = createSupabaseServerClientReadOnly()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth?next=/perfil')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Mi perfil</h1>
        <BackButton />
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
