
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  Trophy,
  Plus,
  Heart,
  Eye,
  Calendar
} from 'lucide-react'
import { formatRelativeDate, pluralize } from '@/lib/utils'
import { ANDARES } from '@/lib/constants'

export default async function HallOfFamePage() {
  const supabase = createServerSupabaseClient()
  
  // Get horses with their media, votes, and comments
  const { data: horses } = await supabase
    .from('horses')
    .select(`
      *,
      andares(name, slug),
      horse_media(public_url, is_cover),
      hall_votes(value),
      hall_comments(id)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Hall of Fame Ecuestre
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Ejemplares{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Excepcionales
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Conoce los caballos criollos más destacados de nuestra comunidad. 
            Cada ejemplar representa la excelencia en su andar y linaje.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {user && (
              <Link href="/hall/nueva">
                <Button size="lg" className="btn-equestrian">
                  <Plus className="mr-2 h-5 w-5" />
                  Agregar ejemplar
                </Button>
              </Link>
            )}
            <Link href="/forums">
              <Button size="lg" variant="outline" className="btn-equestrian-outline">
                <Heart className="mr-2 h-5 w-5" />
                Ir a los foros
              </Button>
            </Link>
          </div>
        </div>

        {/* Andares Navigation */}
        <Card className="horse-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-amber-600" />
              Explorar por andar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {ANDARES.map((andar) => {
                const andarHorses = horses?.filter((horse: any) => 
                  (horse.andares as any)?.slug === andar.slug
                ) ?? []
                
                return (
                  <Link
                    key={andar.slug}
                    href={`/hall/${andar.slug}`}
                    className="group block p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <Image
                          src={`/andares/${andar.slug}.png`}
                          alt={andar.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-amber-600 transition-colors">
                          {andar.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {pluralize(andarHorses.length, 'ejemplar', 'ejemplares')}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured Horses */}
        {horses && horses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {horses.map((horse: any) => {
              const coverImage = (horse.horse_media as any[])?.find((media) => media.is_cover)
              const votesCount = (horse.hall_votes as any[])?.reduce((acc, vote) => acc + vote.value, 0) ?? 0
              const commentsCount = (horse.hall_comments as any[])?.length ?? 0
              
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
                          <Trophy className="h-16 w-16 text-amber-600" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {votesCount > 0 && (
                          <Badge className="bg-white/90 text-gray-800 flex items-center space-x-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span>{votesCount}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800">
                          {(horse.andares as any)?.name}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-2 group-hover:text-amber-600 transition-colors">
                        {horse.name}
                      </h3>
                      
                      {horse.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {horse.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Heart className="mr-1 h-3 w-3" />
                            {votesCount}
                          </div>
                          <div className="flex items-center">
                            <Eye className="mr-1 h-3 w-3" />
                            {commentsCount}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatRelativeDate(horse.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="horse-shadow">
            <CardContent className="text-center py-12">
              <Trophy className="mx-auto h-16 w-16 text-amber-600 mb-4" />
              <h3 className="text-2xl font-bold mb-4">¡El Hall of Fame te está esperando!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sé el primero en compartir un ejemplar excepcional de caballo criollo 
                y comenzar esta prestigiosa galería.
              </p>
              {user ? (
                <Link href="/hall/nueva">
                  <Button className="btn-equestrian">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar primer ejemplar
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button className="btn-equestrian">
                    Inicia sesión para agregar ejemplares
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
