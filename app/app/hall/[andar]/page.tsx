
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Plus, Heart, Eye, Calendar, ArrowLeft } from 'lucide-react'
import { formatRelativeDate, pluralize } from '@/lib/utils'
import { ANDARES } from '@/lib/constants'
import { notFound } from 'next/navigation'

interface Props {
  params: { andar: string }
}

export async function generateStaticParams() {
  return ANDARES.map(andar => ({
    andar: andar.slug
  }))
}

export default async function AndarPage({ params }: Props) {
  const andarInfo = ANDARES.find(a => a.slug === params.andar)
  
  if (!andarInfo) {
    notFound()
  }

  const supabase = createServerSupabaseClient()
  
  // Get horses for this andar
  const { data: horses } = await supabase
    .from('horses')
    .select(`
      *,
      andares(name, slug, description),
      horse_media(
        id,
        media_id,
        is_cover,
        media_files(
          id,
          filename,
          cloud_storage_path,
          mime_type,
          width,
          height
        )
      ),
      hall_votes(value),
      hall_comments(id),
      user_profiles!horses_created_by_fkey(
        id,
        name,
        avatar_url
      )
    `)
    .eq('andar_slug', params.andar)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  // Get andar details
  const { data: andarDetails } = await supabase
    .from('andares')
    .select('*')
    .eq('slug', params.andar)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Navigation */}
        <Link href="/hall">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Hall of Fame
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {andarInfo.name}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Ejemplares de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 ml-2">
              {andarInfo.name}
            </span>
            <Image 
              src="/paso-fino-colombiano.png" 
              alt="Paso Fino Colombiano" 
              width={50} 
              height={50} 
              className="ml-4"
            />
          </h1>
          
          {andarDetails?.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {andarDetails.description}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center">
              <Trophy className="mr-2 h-4 w-4" />
              {pluralize(horses?.length || 0, 'ejemplar', 'ejemplares')}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {user && (
              <Link href="/hall/nueva">
                <Button size="lg" className="btn-equestrian">
                  <Plus className="mr-2 h-5 w-5" />
                  Agregar ejemplar
                </Button>
              </Link>
            )}
            <Link href="/hall">
              <Button size="lg" variant="outline" className="btn-equestrian-outline">
                <Trophy className="mr-2 h-5 w-5" />
                Ver todos los andares
              </Button>
            </Link>
          </div>
        </div>

        {/* Horses Grid */}
        {horses && horses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {horses.map((horse: any) => {
              const coverImage = horse.horse_media?.find((media: any) => media.is_cover)
              const votesCount = horse.hall_votes?.reduce((acc: number, vote: any) => acc + vote.value, 0) || 0
              const commentsCount = horse.hall_comments?.length || 0
              
              return (
                <Link
                  key={horse.id}
                  href={`/hall/${horse.andar_slug}/${horse.slug}`}
                  className="group block"
                >
                  <Card className="card-hover border-0 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      {coverImage?.media_files ? (
                        <Image
                          src={coverImage.media_files.cloud_storage_path}
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
                      
                      {horse.owner_name && (
                        <p className="text-sm text-muted-foreground mb-4">
                          <strong>Propietario:</strong> {horse.owner_name}
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
              <h3 className="text-2xl font-bold mb-4">
                No hay ejemplares de {andarInfo.name} aún
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sé el primero en compartir un ejemplar excepcional de {andarInfo.name.toLowerCase()} 
                en nuestro Hall of Fame.
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
