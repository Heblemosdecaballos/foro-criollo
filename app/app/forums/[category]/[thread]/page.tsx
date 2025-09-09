
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import {
  MessageSquare,
  Heart,
  Bookmark,
  Share,
  ChevronLeft,
  Eye,
  Clock,
  User,
  Pin,
  Lock,
  Reply
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { FORUM_CATEGORIES } from '@/lib/constants'

interface ThreadPageProps {
  params: {
    category: string
    thread: string
  }
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { category: categorySlug, thread: threadSlug } = params
  
  // Find category in constants
  const categoryInfo = FORUM_CATEGORIES.find(cat => cat.slug === categorySlug)
  
  if (!categoryInfo) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()
  
  // Get category from database
  const { data: dbCategory } = await supabase
    .from('forum_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!dbCategory) {
    // Category doesn't exist yet, create a mock thread for demo
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card className="horse-shadow">
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-16 w-16 text-amber-600 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Tema no encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Este tema no existe o ha sido eliminado.
              </p>
              <Link href={`/forums/${categorySlug}`}>
                <Button className="btn-equestrian">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Volver a {categoryInfo.name}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-muted-foreground mb-6">
          <Link href="/forums" className="hover:text-foreground transition-colors">
            Foros
          </Link>
          <span>/</span>
          <Link 
            href={`/forums/${categorySlug}`} 
            className="hover:text-foreground transition-colors"
          >
            {categoryInfo.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">
            {threadSlug.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Back Button */}
        <Link 
          href={`/forums/${categorySlug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Volver a {categoryInfo.name}
        </Link>

        {/* Demo Thread Content */}
        <Card className="horse-shadow mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">
                    {categoryInfo.name}
                  </Badge>
                </div>
                
                <CardTitle className="text-2xl md:text-3xl mb-4 leading-tight">
                  {threadSlug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                </CardTitle>
                
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    Por usuario demo
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    hace 1 hora
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-1 h-3 w-3" />
                    1 vista
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    0 respuestas
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-equestrian max-w-none mb-6">
              <p>
                Esta es una demostración del sistema de foros de Hablando de Caballos. 
                En esta categoría de <strong>{categoryInfo.name}</strong> podrás discutir sobre {categoryInfo.description.toLowerCase()}.
              </p>
              <p>
                Una vez que configures la base de datos Supabase con las credenciales correctas, 
                podrás crear temas reales y participar en discusiones completas.
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" disabled={!user}>
                  <Heart className="mr-2 h-4 w-4" />
                  Me gusta (0)
                </Button>
                <Button variant="ghost" size="sm" disabled={!user}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button variant="ghost" size="sm">
                  <Share className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </div>
              
              {user && (
                <Button size="sm" className="btn-equestrian">
                  <Reply className="mr-2 h-4 w-4" />
                  Responder
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {user && (
          <Card className="horse-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Reply className="mr-2 h-5 w-5 text-amber-600" />
                Escribir respuesta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled
                />
                <div className="flex justify-end">
                  <Button className="btn-equestrian" disabled>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Publicar respuesta
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Las funcionalidades completas se activarán cuando configures la base de datos
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
