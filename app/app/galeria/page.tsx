
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Star,
  Clock,
  Play,
  Upload
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

// Mock data for demo
const mockAlbums = [
  {
    id: '1',
    title: 'Mis caballos de paso fino',
    slug: 'mis-caballos-paso-fino',
    description: 'Colección de fotos de mis ejemplares favoritos',
    media_count: 15,
    views_count: 234,
    is_public: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author: { name: 'Carlos Ecuestre' },
    cover_image: {
      public_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Puerto_rican-Paso-Fino-Horse-chestnut.jpg'
    }
  },
  {
    id: '2',
    title: 'Entrenamientos de doma',
    slug: 'entrenamientos-doma',
    description: 'Videos y fotos de sesiones de entrenamiento',
    media_count: 8,
    views_count: 156,
    is_public: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    author: { name: 'María del Campo' },
    cover_image: null
  }
]

const mockRecentMedia = [
  {
    id: '1',
    title: 'Ejemplar en competencia',
    file_type: 'image',
    views_count: 45,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    author: { name: 'Alex Jinete' },
    public_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Puerto_rican-Paso-Fino-Horse-chestnut.jpg',
    average_rating: 4.5,
    comments: [{ id: '1' }, { id: '2' }]
  },
  {
    id: '2',
    title: 'Técnica de paso fino',
    file_type: 'video',
    views_count: 123,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    author: { name: 'Pedro Trainer' },
    public_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Puerto_rican-Paso-Fino-Horse-chestnut.jpg',
    average_rating: 5,
    comments: [{ id: '3' }]
  }
]

export default async function GaleriaPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9DA] via-white to-[#EBDDCB] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <ImageIcon className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Galería Multimedia Ecuestre
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Galería{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Multimedia
            </span>
            <Image 
              src="/paso-fino-colombiano.png" 
              alt="Paso Fino Colombiano" 
              width={50} 
              height={50} 
              className="ml-4"
            />
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Descubre y comparte las mejores fotos y videos de la comunidad ecuestre. 
            Crea álbumes, valora contenido y conecta a través del arte visual.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {user && (
              <>
                <Link href="/galeria/subir">
                  <Button size="lg" className="btn-equestrian">
                    <Upload className="mr-2 h-5 w-5" />
                    Subir contenido
                  </Button>
                </Link>
                <Link href="/galeria/albums/nuevo">
                  <Button size="lg" className="btn-equestrian">
                    <Plus className="mr-2 h-5 w-5" />
                    Crear álbum
                  </Button>
                </Link>
              </>
            )}
            <Button size="lg" variant="outline" className="btn-equestrian-outline">
              <Search className="mr-2 h-5 w-5" />
              Explorar galería
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Álbumes</p>
                  <p className="text-2xl font-bold text-blue-600">{mockAlbums.length}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fotos</p>
                  <p className="text-2xl font-bold text-green-600">150</p>
                </div>
                <ImageIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Videos</p>
                  <p className="text-2xl font-bold text-purple-600">25</p>
                </div>
                <Video className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Visualizaciones</p>
                  <p className="text-2xl font-bold text-amber-600">2.5k</p>
                </div>
                <Eye className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Albums */}
            <Card className="horse-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5 text-amber-600" />
                    Álbumes destacados
                  </CardTitle>
                  <Link href="/galeria/albums">
                    <Button variant="outline" size="sm">
                      Ver todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {mockAlbums.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {mockAlbums.map((album: any) => (
                      <Link
                        key={album.id}
                        href={`/galeria/albums/${album.slug}`}
                        className="group block"
                      >
                        <Card className="card-hover border-0 shadow-md group-hover:shadow-xl transition-all duration-300">
                          <div className="relative aspect-video overflow-hidden rounded-t-lg">
                            {album.cover_image ? (
                              <Image
                                src={album.cover_image.public_url}
                                alt={album.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 to-orange-900 flex items-center justify-center">
                                <ImageIcon className="h-16 w-16 text-amber-600" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-white/90 text-gray-800">
                                {album.media_count} fotos
                              </Badge>
                            </div>
                          </div>
                          
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
                              {album.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Por {album.author?.name}
                            </p>
                            {album.description && (
                              <p className="text-sm line-clamp-2 text-gray-600 dark:text-gray-400 mb-3">
                                {album.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Eye className="mr-1 h-3 w-3" />
                                {album.views_count} vistas
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatRelativeDate(album.created_at)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="mx-auto h-16 w-16 text-amber-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-4">¡Crea el primer álbum!</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Organiza tus mejores fotos y videos en álbumes temáticos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Media */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-amber-600" />
                  Contenido reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {mockRecentMedia.map((media: any) => (
                    <Link
                      key={media.id}
                      href={`/galeria/media/${media.id}`}
                      className="group block"
                    >
                      <Card className="card-hover border-0 shadow-md group-hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg">
                          <Image
                            src={media.public_url}
                            alt={media.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {media.file_type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 rounded-full p-3">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 flex space-x-2">
                            <Badge className="bg-white/90 text-gray-800 flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{media.average_rating?.toFixed(1)}</span>
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
                            {media.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Por {media.author?.name}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <Eye className="mr-1 h-3 w-3" />
                                {media.views_count}
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="mr-1 h-3 w-3" />
                                {media.comments?.length ?? 0}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatRelativeDate(media.created_at)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-md">
                    <ImageIcon className="h-4 w-4" />
                    <span>Datos de demostración - Configura Supabase para galería real</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {user && (
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Acciones rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/galeria/subir">
                    <Button className="w-full justify-start btn-equestrian">
                      <Upload className="mr-2 h-4 w-4" />
                      Subir foto/video
                    </Button>
                  </Link>
                  <Link href="/galeria/albums/nuevo">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear álbum
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-amber-600" />
                  Categorías
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/galeria/categoria/caballos"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  🐎 Caballos y ejemplares
                </Link>
                <Link
                  href="/galeria/categoria/entrenamientos"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  🏇 Entrenamientos
                </Link>
                <Link
                  href="/galeria/categoria/competencias"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  🏆 Competencias
                </Link>
                <Link
                  href="/galeria/categoria/paisajes"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  🌄 Paisajes ecuestres
                </Link>
                <Link
                  href="/galeria/categoria/equipos"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  🛠️ Equipos y accesorios
                </Link>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Tags populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['paso-fino', 'trocha', 'doma', 'competencia', 'entrenamiento', 'criollo-colombiano'].map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-accent">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
