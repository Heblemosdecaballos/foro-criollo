
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare,
  Users,
  Trophy,
  TrendingUp,
  Eye,
  Clock,
  ChevronRight,
  Heart,
  ShoppingCart
} from 'lucide-react'
import { formatRelativeDate, pluralize } from '@/lib/utils'
import { ForumStats } from '@/lib/types'

// Mock data for demo
const mockStats: ForumStats = {
  total_threads: 15,
  total_replies: 42,
  total_users: 8
}

const mockRecentThreads = [
  {
    id: '1',
    title: 'Técnicas de doma para caballos de paso fino',
    slug: 'tecnicas-de-doma-paso-fino',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    forum_categories: { slug: 'monta-y-entrenamiento', name: 'Monta y entrenamiento' },
    forum_replies: [{ id: '1' }, { id: '2' }],
    view_count: 28
  },
  {
    id: '2',
    title: 'Mejores alimentos para caballos criollos',
    slug: 'mejores-alimentos-caballos-criollos',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    forum_categories: { slug: 'cuidados-y-salud', name: 'Cuidados y salud' },
    forum_replies: [{ id: '3' }],
    view_count: 15
  },
  {
    id: '3',
    title: 'Vendo montura colombiana en excelente estado',
    slug: 'vendo-montura-colombiana',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    forum_categories: { slug: 'mercado', name: 'Mercado' },
    forum_replies: [],
    view_count: 8
  }
]

const mockFeaturedHorses = [
  {
    id: '1',
    name: 'Relámpago del Valle',
    slug: 'relampago-del-valle',
    andar_slug: 'paso-fino',
    description: 'Excepcional ejemplar de paso fino con línea de sangre pura',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    andares: { name: 'Paso Fino', slug: 'paso-fino' },
    horse_media: [
      {
        id: '1',
        public_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Puerto_rican-Paso-Fino-Horse-chestnut.jpg',
        is_cover: true
      }
    ],
    hall_votes: [{ value: 1 }, { value: 1 }, { value: 1 }],
    hall_comments: [{ id: '1' }, { id: '2' }]
  },
  {
    id: '2',
    name: 'Estrella Dorada',
    slug: 'estrella-dorada',
    andar_slug: 'trocha',
    description: 'Yegua de trocha con excelente temperamento y movimiento',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    andares: { name: 'Trocha', slug: 'trocha' },
    horse_media: [],
    hall_votes: [{ value: 1 }, { value: 1 }],
    hall_comments: [{ id: '3' }]
  }
]

export default async function HomePage() {
  const stats = mockStats
  const recentThreads = mockRecentThreads
  const featuredHorses = mockFeaturedHorses

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9DA] via-white to-[#EBDDCB] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 dark:from-amber-900/40 dark:to-orange-900/40" />
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
              <Trophy className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                El punto de encuentro del caballo criollo colombiano
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
              Hablando de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                Caballos
              </span>
              <Image 
                src="/paso-fino-colombiano.png" 
                alt="Paso Fino Colombiano" 
                width={60} 
                height={60} 
                className="ml-4"
              />
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              La plataforma más completa para amantes de los caballos criollos. 
              Descubre ejemplares excepcionales, participa en discusiones especializadas 
              y conecta con la comunidad ecuestre más apasionada.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/forums">
                <Button size="lg" className="btn-equestrian">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Explorar Foros
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" className="btn-equestrian">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Marketplace
                </Button>
              </Link>
              <Link href="/hall">
                <Button size="lg" variant="outline" className="btn-equestrian-outline">
                  <Trophy className="mr-2 h-5 w-5" />
                  Hall of Fame
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 -mt-10 relative z-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="card-hover horse-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Temas activos</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.total_threads}</p>
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
                      <p className="text-2xl font-bold text-green-600">{stats.total_replies}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover horse-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Miembros</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.total_users}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Forum Activity */}
            <Card className="horse-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center">
                    <TrendingUp className="mr-2 h-6 w-6 text-amber-600" />
                    Actividad reciente en foros
                  </CardTitle>
                  <Link href="/forums">
                    <Button variant="outline" size="sm">
                      Ver todos
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentThreads.map((thread: any) => (
                    <Link 
                      key={thread.id}
                      href={`/forums/${thread.forum_categories?.slug}/${thread.slug}`}
                      className="block p-4 rounded-lg hover:bg-accent transition-colors border"
                    >
                      <div className="flex items-start justify-between">
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
                              {pluralize(thread.forum_replies?.length ?? 0, 'respuesta', 'respuestas')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatRelativeDate(thread.created_at)}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                      </div>
                    </Link>
                  ))}
                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-md">
                      <Trophy className="h-4 w-4" />
                      <span>Datos de demostración - Configura Supabase para contenido real</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Horses from Hall of Fame */}
            <Card className="horse-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center">
                    <Trophy className="mr-2 h-6 w-6 text-amber-600" />
                    Ejemplares destacados
                  </CardTitle>
                  <Link href="/hall">
                    <Button variant="outline" size="sm">
                      Ver Hall of Fame
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredHorses.map((horse: any) => {
                    const coverImage = horse.horse_media?.find((media: any) => media.is_cover)
                    const votesCount = horse.hall_votes?.reduce((acc: number, vote: any) => acc + vote.value, 0) ?? 0
                    
                    return (
                      <Link
                        key={horse.id}
                        href={`/hall/${horse.andar_slug}/${horse.slug}`}
                        className="group block"
                      >
                        <Card className="card-hover border-0 shadow-md group-hover:shadow-xl transition-all duration-300">
                          <div className="relative aspect-video overflow-hidden rounded-t-lg">
                            {coverImage ? (
                              <Image
                                src={coverImage.public_url}
                                alt={horse.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 to-orange-900 flex items-center justify-center">
                                <Trophy className="h-12 w-12 text-amber-600" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-white/90 text-gray-800 flex items-center space-x-1">
                                <Heart className="h-3 w-3 text-red-500" />
                                <span>{votesCount}</span>
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1 group-hover:text-amber-600 transition-colors">
                              {horse.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {horse.andares?.name}
                            </p>
                            {horse.description && (
                              <p className="text-sm line-clamp-2 text-gray-600 dark:text-gray-400">
                                {horse.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
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
