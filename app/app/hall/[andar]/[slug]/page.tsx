
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Trophy, 
  ArrowLeft, 
  Calendar, 
  User, 
  Ruler, 
  Palette, 
  Award,
  ExternalLink,
  Heart,
  MessageCircle,
  Star
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { HorseGallery } from '@/components/hall/horse-gallery'
import { HorseDetailClient } from '@/components/hall/horse-detail-client'
import { HorseVoting } from '@/components/hall/horse-voting'
import { HorseComments } from '@/components/hall/horse-comments'

interface Props {
  params: { andar: string; slug: string }
}

// Force dynamic rendering for pages with user-specific content
export const dynamic = 'force-dynamic'

export default async function HorseDetailPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()
  
  const { data: horse, error } = await supabase
    .from('horses')
    .select(`
      *,
      andares(name, slug, description),
      horse_media(
        id,
        media_id,
        is_cover,
        caption,
        order_index,
        media_files(
          id,
          filename,
          cloud_storage_path,
          mime_type,
          width,
          height,
          alt_text,
          description
        )
      ),
      hall_votes(
        id,
        value,
        user_id,
        created_at
      ),
      user_profiles!horses_created_by_fkey(
        id,
        name,
        avatar_url,
        bio,
        location
      )
    `)
    .eq('andar_slug', params.andar)
    .eq('slug', params.slug)
    .eq('is_deleted', false)
    .single()

  if (error || !horse) {
    notFound()
  }

  // Calculate stats (server-side)
  const votes = horse.hall_votes || []
  const totalVotes = votes.length
  const votesSum = votes.reduce((acc: number, vote: any) => acc + vote.value, 0)
  const averageRating = totalVotes > 0 ? votesSum / totalVotes : 0

  // Organize media
  const sortedMedia = horse.horse_media?.sort((a: any, b: any) => a.order_index - b.order_index) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/hall/${params.andar}`}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a {horse.andares.name}
            </Button>
          </Link>
          
          <HorseDetailClient 
            horseId={horse.id}
            createdBy={horse.created_by}
            editUrl={`/hall/${params.andar}/${params.slug}/editar`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <Card className="horse-shadow">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="mb-2">
                      {horse.andares.name}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {horse.name}
                    </h1>
                    {horse.owner_name && (
                      <p className="text-lg text-muted-foreground">
                        Propietario: {horse.owner_name}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-5 w-5 text-amber-500 fill-current" />
                      <span className="text-lg font-bold">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                    </p>
                  </div>
                </div>

                {horse.description && (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {horse.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery */}
            {sortedMedia.length > 0 && (
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle>Galería</CardTitle>
                </CardHeader>
                <CardContent>
                  <HorseGallery media={sortedMedia} horseName={horse.name} />
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle>Detalles del ejemplar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {horse.birth_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">Fecha de nacimiento</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(horse.birth_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {horse.color && (
                    <div className="flex items-center space-x-3">
                      <Palette className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">Color</p>
                        <p className="text-sm text-muted-foreground">{horse.color}</p>
                      </div>
                    </div>
                  )}
                  
                  {horse.height_cm && (
                    <div className="flex items-center space-x-3">
                      <Ruler className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">Alzada</p>
                        <p className="text-sm text-muted-foreground">{horse.height_cm} cm</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Agregado por</p>
                      <p className="text-sm text-muted-foreground">
                        {horse.user_profiles.name}
                      </p>
                    </div>
                  </div>
                </div>

                {horse.pedigree_url && (
                  <div className="pt-4 border-t">
                    <a
                      href={horse.pedigree_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Ver pedigree completo</span>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Awards */}
            {horse.awards && horse.awards.length > 0 && (
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-amber-600" />
                    Premios y reconocimientos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {horse.awards.map((award: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Trophy className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span>{award}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments - Client Component */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-amber-600" />
                  Comentarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HorseComments horseId={horse.id} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting - Client Component */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-amber-600" />
                  Valora este ejemplar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HorseVoting 
                  horseId={horse.id}
                  currentVote={null}
                  totalVotes={totalVotes}
                  averageRating={averageRating}
                />
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle>Información del creador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                    {horse.user_profiles.avatar_url ? (
                      <Image
                        src={horse.user_profiles.avatar_url}
                        alt={horse.user_profiles.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-6 w-6 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{horse.user_profiles.name}</p>
                    {horse.user_profiles.location && (
                      <p className="text-sm text-muted-foreground">
                        {horse.user_profiles.location}
                      </p>
                    )}
                  </div>
                </div>
                
                {horse.user_profiles.bio && (
                  <p className="text-sm text-muted-foreground">
                    {horse.user_profiles.bio}
                  </p>
                )}
                
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  <p>Agregado {formatRelativeDate(horse.created_at)}</p>
                </div>

                <Link href={`/usuario/${horse.user_profiles.id}`}>
                  <Button variant="outline" className="w-full">
                    Ver perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle>Compartir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/hall/${params.andar}/${params.slug}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Copiar enlace
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
