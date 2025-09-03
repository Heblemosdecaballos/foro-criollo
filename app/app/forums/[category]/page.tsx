
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  MessageSquare,
  Users,
  Heart,
  Trophy,
  Truck,
  ShoppingCart,
  Coffee,
  Pin,
  Lock,
  Eye,
  Clock,
  Plus,
  ChevronLeft
} from 'lucide-react'
import { formatRelativeDate, pluralize } from '@/lib/utils'
import { ForumStats } from '@/lib/types'
import { FORUM_CATEGORIES } from '@/lib/constants'

const iconMap = {
  Users,
  Heart,
  Trophy,
  Truck,
  ShoppingCart,
  Coffee
}

interface CategoryPageProps {
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = params
  
  // Find category in constants
  const categoryInfo = FORUM_CATEGORIES.find(cat => cat.slug === categorySlug)
  
  if (!categoryInfo) {
    notFound()
  }

  const supabase = createServerSupabaseClient()
  
  // Get forum statistics
  const [threadsData, repliesData, usersData] = await Promise.all([
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
    supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
    supabase.auth.admin.listUsers()
  ])

  const stats: ForumStats = {
    total_threads: threadsData.count ?? 0,
    total_replies: repliesData.count ?? 0,
    total_users: usersData.data?.users?.length ?? 0
  }

  // Get category from database
  const { data: dbCategory } = await supabase
    .from('forum_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  // Get threads for this category
  const { data: threads } = await supabase
    .from('forum_threads')
    .select(`
      *,
      forum_replies(id, created_at)
    `)
    .eq('category_id', dbCategory?.id ?? 'non-existent')
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap] || MessageSquare

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <Link href="/forums" className="hover:text-foreground transition-colors">
                  Foros
                </Link>
                <span>/</span>
                <span>{categoryInfo.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <IconComponent className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {categoryInfo.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      {categoryInfo.description}
                    </p>
                  </div>
                </div>
                {user && (
                  <Link href="/forums/create">
                    <Button className="btn-equestrian">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear tema
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Back to Forums */}
            <Link 
              href="/forums"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver a todos los foros
            </Link>

            {/* Category Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="card-hover horse-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Temas</p>
                      <p className="text-2xl font-bold text-blue-600">{threads?.length ?? 0}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover horse-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Respuestas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {threads?.reduce((acc: number, thread: any) => acc + ((thread.forum_replies as any[])?.length ?? 0), 0) ?? 0}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover horse-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Posts totales</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {(threads?.length ?? 0) + (threads?.reduce((acc: number, thread: any) => acc + ((thread.forum_replies as any[])?.length ?? 0), 0) ?? 0)}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Threads List */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-amber-600" />
                  Temas en {categoryInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threads && threads.length > 0 ? (
                    threads.map((thread: any) => (
                      <Link 
                        key={thread.id}
                        href={`/forums/${categorySlug}/${thread.slug}`}
                        className="block p-4 rounded-lg hover:bg-accent transition-colors border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {thread.is_pinned && (
                              <Pin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                            )}
                            {thread.is_locked && (
                              <Lock className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                {thread.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  {pluralize((thread.forum_replies as any[])?.length ?? 0, 'respuesta', 'respuestas')}
                                </div>
                                <div className="flex items-center">
                                  <Eye className="mr-1 h-3 w-3" />
                                  {pluralize(thread.view_count, 'vista', 'vistas')}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {formatRelativeDate(thread.updated_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <IconComponent className="mx-auto h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay temas en esta categoría</h3>
                      <p className="mb-4">Sé el primero en iniciar una conversación sobre {categoryInfo.name.toLowerCase()}</p>
                      {user ? (
                        <Link href="/forums/create">
                          <Button className="btn-equestrian">
                            <Plus className="mr-2 h-4 w-4" />
                            Crear primer tema
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth/login">
                          <Button className="btn-equestrian">
                            Inicia sesión para crear temas
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar stats={stats} />
          </div>
        </div>
      </div>
    </div>
  )
}
