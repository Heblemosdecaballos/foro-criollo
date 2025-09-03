
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  MessageSquare,
  Trophy,
  ShoppingCart,
  Image as ImageIcon,
  Eye,
  Clock
} from 'lucide-react'
import { SEARCH_TYPES, SORT_OPTIONS, FORUM_CATEGORIES, MARKETPLACE_CATEGORIES } from '@/lib/constants'
import { formatRelativeDate, formatPrice } from '@/lib/utils'
import { SearchFilters } from '@/lib/types'

// Mock search results
const mockResults = [
  {
    id: '1',
    type: 'thread' as const,
    title: 'Mejores técnicas para entrenar caballos de paso fino',
    content: 'En este hilo discutimos las mejores técnicas para el entrenamiento de caballos de paso fino, incluyendo ejercicios específicos y métodos probados...',
    url: '/forums/monta-y-entrenamiento/mejores-tecnicas-entrenar-paso-fino',
    author: { name: 'Carlos Entrenador' },
    category: 'Monta y entrenamiento',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Puerto_rican-Paso-Fino-Horse-chestnut.jpg',
    metadata: { replies: 15, views: 234, likes: 8 }
  },
  {
    id: '2',
    type: 'horse' as const,
    title: 'Relámpago del Valle - Excepcional paso fino',
    content: 'Ejemplar extraordinario de paso fino con excelente línea de sangre y movimiento perfecto. Ganador de múltiples competencias...',
    url: '/hall/paso-fino/relampago-del-valle',
    author: { name: 'María Criadora' },
    category: 'Paso Fino',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Puerto_rican-Paso-Fino-Horse-chestnut.jpg',
    metadata: { votes: 12, comments: 5 }
  },
  {
    id: '3',
    type: 'ad' as const,
    title: 'Montura colombiana artesanal en cuero premium',
    content: 'Hermosa montura artesanal fabricada en cuero colombiano de la más alta calidad. Ideal para caballos de paso fino y trocha...',
    url: '/marketplace/anuncio/montura-colombiana-artesanal',
    author: { name: 'Pedro Talabartero' },
    category: 'Equipos y accesorios',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    thumbnail: null,
    metadata: { price: 2500000, currency: 'COP', location: 'Medellín, Antioquia', views: 89 }
  }
]

export default function BuscarPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    sort_by: 'relevance',
    sort_order: 'desc'
  })
  
  const [results, setResults] = useState(mockResults)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      setResults(mockResults)
      setIsSearching(false)
    }, 1000)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'thread': return MessageSquare
      case 'horse': return Trophy
      case 'ad': return ShoppingCart
      case 'media': return ImageIcon
      default: return Search
    }
  }

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'thread': return 'Tema del foro'
      case 'horse': return 'Hall of Fame'
      case 'ad': return 'Marketplace'
      case 'media': return 'Galería'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9DA] via-white to-[#EBDDCB] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <Search className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Búsqueda Avanzada
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Buscar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Contenido
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
            Encuentra exactamente lo que buscas con nuestro sistema de búsqueda avanzada. 
            Filtra por tipo de contenido, fecha, categoría y más.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="horse-shadow sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-amber-600" />
                  Filtros de búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Query */}
                <div>
                  <Label htmlFor="query">Buscar por palabras clave</Label>
                  <Input
                    id="query"
                    placeholder="Ingresa tu búsqueda..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                  />
                </div>

                {/* Content Type */}
                <div>
                  <Label htmlFor="type">Tipo de contenido</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEARCH_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={filters.category || ''} onValueChange={(value) => handleFilterChange('category', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {FORUM_CATEGORIES.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                      {MARKETPLACE_CATEGORIES.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name} (Marketplace)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div>
                  <Label>Rango de fechas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                    />
                    <Input
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                    />
                  </div>
                </div>

                {/* Author */}
                <div>
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    id="author"
                    placeholder="Nombre del autor..."
                    value={filters.author || ''}
                    onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
                  />
                </div>

                {/* Advanced Filters */}
                <div className="space-y-4">
                  <Label>Filtros avanzados</Label>
                  
                  <div>
                    <Label htmlFor="min_replies">Mínimo de respuestas</Label>
                    <Input
                      id="min_replies"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={filters.min_replies || ''}
                      onChange={(e) => handleFilterChange('min_replies', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_rating">Calificación mínima</Label>
                    <Select value={filters.min_rating?.toString() || ''} onValueChange={(value) => handleFilterChange('min_rating', value ? parseInt(value) : undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier calificación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquier calificación</SelectItem>
                        <SelectItem value="1">⭐ 1 estrella o más</SelectItem>
                        <SelectItem value="2">⭐⭐ 2 estrellas o más</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ 3 estrellas o más</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ 4 estrellas o más</SelectItem>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ 5 estrellas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location for marketplace items */}
                  <div>
                    <Label htmlFor="location">Ubicación (Marketplace)</Label>
                    <Input
                      id="location"
                      placeholder="Ciudad, departamento..."
                      value={filters.location || ''}
                      onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                    />
                  </div>

                  {/* Price range for marketplace */}
                  <div>
                    <Label>Rango de precio (COP)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Mín."
                        value={filters.price_min || ''}
                        onChange={(e) => handleFilterChange('price_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                      <Input
                        type="number"
                        placeholder="Máx."
                        value={filters.price_max || ''}
                        onChange={(e) => handleFilterChange('price_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <Label htmlFor="sort">Ordenar por</Label>
                  <Select value={filters.sort_by} onValueChange={(value) => handleFilterChange('sort_by', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <Button 
                  onClick={handleSearch} 
                  className="w-full btn-equestrian"
                  disabled={isSearching}
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Summary */}
            <Card className="horse-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Resultados de búsqueda
                    {filters.query && ` para "${filters.query}"`}
                  </h2>
                  <Badge variant="secondary">
                    {results.length} resultados encontrados
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <div className="space-y-4">
              {results.map((result) => {
                const IconComponent = getResultIcon(result.type)
                
                return (
                  <Card key={result.id} className="horse-shadow hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            {result.thumbnail ? (
                              <Image
                                src={result.thumbnail}
                                alt={result.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <IconComponent className="h-8 w-8 text-amber-600" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {getResultTypeLabel(result.type)}
                              </Badge>
                              <h3 className="font-semibold text-lg hover:text-amber-600 transition-colors">
                                <Link href={result.url}>
                                  {result.title}
                                </Link>
                              </h3>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {result.content}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Por {result.author?.name}</span>
                              <span>•</span>
                              <span>{result.category}</span>
                              <span>•</span>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatRelativeDate(result.created_at)}
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              {result.type === 'thread' && result.metadata && (
                                <>
                                  <div className="flex items-center">
                                    <MessageSquare className="mr-1 h-3 w-3" />
                                    {result.metadata.replies}
                                  </div>
                                  <div className="flex items-center">
                                    <Eye className="mr-1 h-3 w-3" />
                                    {result.metadata.views}
                                  </div>
                                </>
                              )}
                              {result.type === 'ad' && result.metadata && (
                                <>
                                  <div className="font-semibold text-amber-600">
                                    {formatPrice(result.metadata.price, result.metadata.currency)}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {result.metadata.location}
                                  </div>
                                </>
                              )}
                              {result.type === 'horse' && result.metadata && (
                                <>
                                  <div className="flex items-center">
                                    <Trophy className="mr-1 h-3 w-3" />
                                    {result.metadata.votes}
                                  </div>
                                  <div className="flex items-center">
                                    <MessageSquare className="mr-1 h-3 w-3" />
                                    {result.metadata.comments}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Demo Notice */}
            <Card className="horse-shadow">
              <CardContent className="text-center py-8">
                <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-md">
                  <Search className="h-4 w-4" />
                  <span>Datos de demostración - Configura Supabase para búsqueda real</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
