
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  MapPin,
  Eye,
  MessageCircle,
  Heart,
  Clock
} from 'lucide-react'
import { formatRelativeDate, formatPrice } from '@/lib/utils'
import { MARKETPLACE_CATEGORIES } from '@/lib/constants'

export default async function MarketplacePage() {
  const supabase = createServerSupabaseClient()
  
  // Get recent ads with their images and stats
  const { data: ads } = await supabase
    .from('marketplace_ads')
    .select(`
      *,
      marketplace_categories(name, slug, icon),
      ad_images(public_url, is_primary),
      ad_comments(id),
      ad_favorites(id)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: { user } } = await supabase.auth.getUser()

  // Get stats
  const { count: totalAds } = await supabase
    .from('marketplace_ads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebddcb] via-[#ebddcb] to-[#ebddcb] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Marketplace Ecuestre
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Mercado{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Criollo
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
            Encuentra todo lo que necesitas para tu pasión ecuestre. 
            Compra, vende y conecta con la comunidad de caballos criollos más grande de Colombia.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {user && (
              <Link href="/marketplace/nuevo">
                <Button size="lg" className="btn-equestrian">
                  <Plus className="mr-2 h-5 w-5" />
                  Publicar anuncio
                </Button>
              </Link>
            )}
            <Button size="lg" variant="outline" className="btn-equestrian-outline">
              <Search className="mr-2 h-5 w-5" />
              Buscar avanzado
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anuncios activos</p>
                  <p className="text-2xl font-bold text-amber-600">{totalAds || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold text-green-600">{MARKETPLACE_CATEGORIES.length}</p>
                </div>
                <Filter className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nuevos hoy</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Favoritos</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card className="horse-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5 text-amber-600" />
              Explorar por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {MARKETPLACE_CATEGORIES.map((category) => {
                const categoryAds = ads?.filter((ad: any) => 
                  (ad.marketplace_categories as any)?.slug === category.slug
                ) ?? []
                
                return (
                  <Link
                    key={category.slug}
                    href={`/marketplace/${category.slug}`}
                    className="group block p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="text-center space-y-2">
                      <div className="relative w-12 h-12 mx-auto overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Image
                          src="/paso-fino-colombiano.png"
                          alt="Categoría"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-amber-600 transition-colors text-sm">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {categoryAds.length} anuncios
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Ads */}
        {ads && ads.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Anuncios recientes</h2>
              <Link href="/marketplace/todos">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ads.map((ad: any) => {
                const primaryImage = (ad.ad_images as any[])?.find((img) => img.is_primary)
                const commentsCount = (ad.ad_comments as any[])?.length ?? 0
                const favoritesCount = (ad.ad_favorites as any[])?.length ?? 0
                
                return (
                  <Link
                    key={ad.id}
                    href={`/marketplace/anuncio/${ad.slug}`}
                    className="group block"
                  >
                    <Card className="card-hover border-0 shadow-md group-hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.public_url}
                            alt={ad.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 to-orange-900 flex items-center justify-center">
                            <ShoppingCart className="h-16 w-16 text-amber-600" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          {ad.is_featured && (
                            <Badge className="bg-amber-500 text-white">Destacado</Badge>
                          )}
                          {favoritesCount > 0 && (
                            <Badge className="bg-white/90 text-gray-800 flex items-center space-x-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span>{favoritesCount}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 text-gray-800">
                            {(ad.marketplace_categories as any)?.name}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                          {ad.title}
                        </h3>
                        
                        <div className="text-2xl font-bold text-amber-600 mb-2">
                          {formatPrice(ad.price, ad.currency)}
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="mr-1 h-3 w-3" />
                          {ad.location}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Eye className="mr-1 h-3 w-3" />
                              {ad.views_count}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="mr-1 h-3 w-3" />
                              {commentsCount}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatRelativeDate(ad.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <Card className="horse-shadow">
            <CardContent className="text-center py-12">
              <ShoppingCart className="mx-auto h-16 w-16 text-amber-600 mb-4" />
              <h3 className="text-2xl font-bold mb-4">¡Sé el primero en vender!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                El marketplace está esperando tu primer anuncio. Comparte lo que tienes 
                para ofrecer a la comunidad ecuestre.
              </p>
              {user ? (
                <Link href="/marketplace/nuevo">
                  <Button className="btn-equestrian">
                    <Plus className="mr-2 h-4 w-4" />
                    Publicar primer anuncio
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button className="btn-equestrian">
                    Inicia sesión para vender
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
