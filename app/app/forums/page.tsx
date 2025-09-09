
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
  Plus
} from 'lucide-react'
import { formatRelativeDate, pluralize } from '@/lib/utils'
import { ForumCategory, ForumStats } from '@/lib/types'
import { FORUM_CATEGORIES } from '@/lib/constants'

const iconMap = {
  Users,
  Heart,
  Trophy,
  Truck,
  ShoppingCart,
  Coffee
}

export default async function ForumsPage() {
  const supabase = await createServerSupabaseClient()
  
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

  // Get categories with thread counts and latest activity
  const { data: categories } = await supabase
    .from('forum_categories')
    .select(`
      *,
      forum_threads!inner(
        id,
        title,
        created_at,
        created_by,
        forum_replies(id)
      )
    `)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Process categories data to get proper stats
  const processedCategories: (ForumCategory & {
    threads_count: number
    posts_count: number
    latest_thread?: any
  })[] = FORUM_CATEGORIES.map(categoryTemplate => {
    const dbCategory = categories?.find((cat: any) => cat.slug === categoryTemplate.slug)
    const threads = (dbCategory?.forum_threads as any[]) || []
    const posts_count = threads.reduce((acc: number, thread: any) => 
      acc + (thread.forum_replies?.length ?? 0), 0) + threads.length

    const latest_thread = threads.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    return {
      id: dbCategory?.id ?? categoryTemplate.slug,
      slug: categoryTemplate.slug,
      name: categoryTemplate.name,
      description: categoryTemplate.description,
      icon: categoryTemplate.icon,
      order_index: categoryTemplate.order_index,
      is_active: dbCategory?.is_active ?? true,
      created_at: dbCategory?.created_at ?? new Date().toISOString(),
      threads_count: threads.length,
      posts_count,
      latest_thread
    }
  })

  // Get pinned and recent threads across all categories
  const { data: pinnedThreads } = await supabase
    .from('forum_threads')
    .select(`
      *,
      forum_categories!inner(name, slug),
      forum_replies(id)
    `)
    .eq('is_pinned', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentThreads } = await supabase
    .from('forum_threads')
    .select(`
      *,
      forum_categories!inner(name, slug),
      forum_replies(id)
    `)
    .eq('is_deleted', false)
    .eq('is_pinned', false)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Foros de discusión
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Participa en conversaciones sobre el mundo ecuestre
                </p>
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

            {/* Forum Categories */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-amber-600" />
                  Categorías del foro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {processedCategories.map((category) => {
                    const IconComponent = iconMap[category.icon as keyof typeof iconMap] || MessageSquare
                    
                    return (
                      <Link
                        key={category.slug}
                        href={`/forums/${category.slug}`}
                        className="block p-4 rounded-lg hover:bg-accent transition-colors border-b border-border/50 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="mt-1">
                              <IconComponent className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {category.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {category.description}
                              </p>
                              {category.latest_thread && (
                                <p className="text-xs text-muted-foreground">
                                  Último: <span className="font-medium">{category.latest_thread.title}</span> • {formatRelativeDate(category.latest_thread.created_at)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-center space-y-1 min-w-[80px]">
                            <div className="flex space-x-4 text-sm text-muted-foreground">
                              <div>
                                <div className="font-semibold text-foreground">{category.threads_count}</div>
                                <div className="text-xs">Temas</div>
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{category.posts_count}</div>
                                <div className="text-xs">Posts</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Pinned Threads */}
            {pinnedThreads && pinnedThreads.length > 0 && (
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pin className="mr-2 h-5 w-5 text-red-600" />
                    Temas destacados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pinnedThreads.map((thread: any) => (
                      <Link 
                        key={thread.id}
                        href={`/forums/${thread.forum_categories?.slug}/${thread.slug}`}
                        className="block p-4 rounded-lg hover:bg-accent transition-colors border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Pin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                {thread.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <Badge variant="secondary">
                                  {thread.forum_categories?.name}
                                </Badge>
                                <div className="flex items-center">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  {pluralize((thread.forum_replies as any[])?.length ?? 0, 'respuesta', 'respuestas')}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {formatRelativeDate(thread.created_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Threads */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  Temas recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentThreads?.map((thread: any) => (
                    <Link 
                      key={thread.id}
                      href={`/forums/${thread.forum_categories?.slug}/${thread.slug}`}
                      className="block p-4 rounded-lg hover:bg-accent transition-colors border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {thread.is_locked && (
                            <Lock className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                              {thread.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <Badge variant="secondary">
                                {thread.forum_categories?.name}
                              </Badge>
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
                                {formatRelativeDate(thread.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )) ?? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay temas aún</h3>
                      <p className="mb-4">Sé el primero en iniciar una conversación</p>
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
