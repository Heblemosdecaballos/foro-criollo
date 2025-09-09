
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { CreateThreadForm } from '@/components/forums/create-thread-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { FORUM_CATEGORIES } from '@/lib/constants'

// ✅ NUEVA ARQUITECTURA SSR

export default async function CreateThreadPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user || error) {
    console.log('🔒 Usuario no autenticado, redirigiendo al login')
    redirect('/auth/login?redirect=/forums/create')
  }

  console.log('✅ Usuario autenticado para crear thread:', user.email)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="horse-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <MessageSquare className="mr-2 h-6 w-6 text-amber-600" />
              Crear nuevo tema
            </CardTitle>
            <p className="text-muted-foreground">
              Inicia una nueva discusión en la comunidad
            </p>
          </CardHeader>
          <CardContent>
            <CreateThreadForm categories={FORUM_CATEGORIES} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
