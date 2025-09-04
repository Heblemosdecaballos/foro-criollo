

import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Clock, ChevronRight, Plus } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

// Mock data for stories
const mockStories = [
  {
    id: '1',
    title: 'La Leyenda de Relámpago del Valle',
    slug: 'leyenda-relampago-del-valle',
    excerpt: 'La fascinante historia de uno de los ejemplares más destacados del paso fino colombiano...',
    content: '...',
    featured_image: '/paso-fino-colombiano.png',
    author: 'Admin',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    category: 'Ejemplares Legendarios',
    read_time: 5,
    views: 234
  },
  {
    id: '2',
    title: 'Tradición Ecuestre en los Llanos Orientales',
    slug: 'tradicion-ecuestre-llanos',
    excerpt: 'Un viaje por la historia de la ganadería equina en las vastas llanuras colombianas...',
    content: '...',
    featured_image: '/paso-fino-colombiano.png',
    author: 'Admin',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    category: 'Cultura',
    read_time: 7,
    views: 456
  },
  {
    id: '3',
    title: 'Los Cuatro Andares: Patrimonio Nacional',
    slug: 'cuatro-andares-patrimonio',
    excerpt: 'Descubre cómo los únicos andares del caballo criollo se convirtieron en orgullo nacional...',
    content: '...',
    featured_image: '/paso-fino-colombiano.png',
    author: 'Admin',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    category: 'Historia',
    read_time: 6,
    views: 189
  }
]

export default async function HistoriasPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // In a real app, we would fetch stories from the database
  const stories = mockStories

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebddcb] via-[#ebddcb] to-[#ebddcb] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <Image 
              src="/paso-fino-colombiano.png" 
              alt="Caballo Criollo" 
              width={20} 
              height={20}
            />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Historias Ecuestres
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Historias{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Ecuestres
            </span>
            <Image 
              src="/paso-fino-colombiano.png" 
              alt="Caballo Criollo" 
              width={50} 
              height={50} 
              className="ml-4"
            />
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Descubre las historias fascinantes, tradiciones y leyendas del caballo criollo colombiano. 
            Artículos exclusivos sobre ejemplares excepcionales y la cultura ecuestre.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {(user?.email === 'admin@hablandodecaballos.com') && (
              <Link href="/historias/nueva">
                <Button size="lg" className="btn-equestrian">
                  <Plus className="mr-2 h-5 w-5" />
                  Nueva historia
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stories Grid */}
        {stories && stories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/historias/${story.slug}`}
                className="group block"
              >
                <Card className="card-hover border-0 shadow-md group-hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 to-orange-900 flex items-center justify-center">
                      <Image 
                        src="/paso-fino-colombiano.png" 
                        alt="Caballo Criollo" 
                        width={64} 
                        height={64}
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        {story.category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-white/90 text-gray-800 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{story.read_time} min</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex-1">
                    <h3 className="font-bold text-xl mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {story.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {story.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatRelativeDate(story.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="horse-shadow">
            <CardContent className="text-center py-12">
              <Image 
                src="/paso-fino-colombiano.png" 
                alt="Caballo Criollo" 
                width={64} 
                height={64}
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold mb-4">¡Próximamente historias increíbles!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Estamos preparando historias fascinantes sobre el caballo criollo colombiano 
                y su rica tradición ecuestre.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

