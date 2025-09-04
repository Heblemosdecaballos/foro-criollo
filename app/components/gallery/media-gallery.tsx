
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Image as ImageIcon,
  Video,
  Upload,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Play,
  Plus,
  Grid3X3,
  List
} from 'lucide-react'
import { MediaFile, MediaAlbum, MediaFilters } from '@/lib/types'
import { FileUpload } from '@/components/upload/file-upload'
import { MediaCard } from './media-card'
import { AlbumCard } from './album-card'
import { formatRelativeDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

interface MediaGalleryProps {
  initialMediaFiles: MediaFile[]
  initialAlbums: MediaAlbum[]
  totalFiles: number
  filters: MediaFilters
  currentUser: any
  category: string
  showUpload?: boolean
}

export function MediaGallery({
  initialMediaFiles,
  initialAlbums,
  totalFiles,
  filters,
  currentUser,
  category,
  showUpload = false
}: MediaGalleryProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(initialMediaFiles)
  const [albums, setAlbums] = useState<MediaAlbum[]>(initialAlbums)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [mediaType, setMediaType] = useState(filters.media_type || 'all')
  const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at')
  const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc')

  const fetchMediaFiles = async (newFilters: Partial<MediaFilters> = {}) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Apply current filters
      if (category) params.set('category', category)
      if (searchQuery) params.set('search', searchQuery)
      if (mediaType !== 'all') params.set('media_type', mediaType)
      if (sortBy) params.set('sort_by', sortBy)
      if (sortOrder) params.set('sort_order', sortOrder)
      
      // Apply new filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString())
        }
      })

      const response = await fetch(`/api/media?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch media files')
      }

      const data = await response.json()
      setMediaFiles(data.files)
    } catch (error) {
      console.error('Error fetching media files:', error)
      toast.error('Error al cargar archivos multimedia')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (uploadedFiles: any[]) => {
    const successfulUploads = uploadedFiles.filter(f => f.upload_status === 'completed')
    if (successfulUploads.length > 0) {
      // Refresh the media files
      fetchMediaFiles()
      setShowUploadDialog(false)
      toast.success(`Se subieron ${successfulUploads.length} archivo(s) correctamente`)
    }
  }

  const handleSearch = () => {
    fetchMediaFiles({ search: searchQuery })
  }

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'media_type') setMediaType(value as 'all' | 'image' | 'video')
    if (key === 'sort_by') setSortBy(value as 'created_at' | 'title' | 'file_size' | 'view_count')
    if (key === 'sort_order') setSortOrder(value as 'desc' | 'asc')
    
    fetchMediaFiles({ [key]: value })
  }

  // Calculate stats
  const imageFiles = mediaFiles.filter(f => f.mime_type.startsWith('image/'))
  const videoFiles = mediaFiles.filter(f => f.mime_type.startsWith('video/'))
  const totalViews = 0 // This would be calculated from view tracking

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
              Galería Equina
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Galería{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Equina
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
            Descubre y comparte las mejores fotos y videos de la comunidad ecuestre. 
            Crea álbumes, valora contenido y conecta a través del arte visual.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {showUpload && (
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn-equestrian">
                    <Upload className="mr-2 h-5 w-5" />
                    Subir contenido
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Subir archivos a la galería</DialogTitle>
                    <DialogDescription>
                      Sube fotos y videos para compartir con la comunidad ecuestre
                    </DialogDescription>
                  </DialogHeader>
                  <FileUpload
                    onUploadComplete={handleUploadComplete}
                    options={{
                      category: category,
                      isPublic: true,
                      generateThumbnail: true,
                      maxFiles: 10,
                      acceptedTypes: ['image/*', 'video/*']
                    }}
                    showAlbumCreation={true}
                    preselectedCategory={category}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Álbumes</p>
                  <p className="text-2xl font-bold text-blue-600">{albums.length}</p>
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
                  <p className="text-2xl font-bold text-green-600">{imageFiles.length}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{videoFiles.length}</p>
                </div>
                <Video className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total archivos</p>
                  <p className="text-2xl font-bold text-amber-600">{totalFiles}</p>
                </div>
                <Eye className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="horse-shadow mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar archivos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <Select value={mediaType} onValueChange={(value) => handleFilterChange('media_type', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="image">Imágenes</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort_by', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Fecha</SelectItem>
                  <SelectItem value="original_filename">Nombre</SelectItem>
                  <SelectItem value="file_size">Tamaño</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value) => handleFilterChange('sort_order', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="btn-equestrian">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="media" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media">Archivos Multimedia</TabsTrigger>
            <TabsTrigger value="albums">Álbumes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="media" className="space-y-6">
            {mediaFiles.length > 0 ? (
              <div className={viewMode === 'grid' ? 
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
                "space-y-4"
              }>
                {mediaFiles.map((file) => (
                  <MediaCard 
                    key={file.id} 
                    media={file} 
                    viewMode={viewMode}
                    currentUser={currentUser}
                    onUpdate={() => fetchMediaFiles()}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ImageIcon className="mx-auto h-24 w-24 text-muted-foreground mb-6 opacity-50" />
                <h3 className="text-2xl font-bold mb-4">No hay archivos multimedia</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {currentUser 
                    ? "Sé el primero en compartir fotos y videos con la comunidad."
                    : "Inicia sesión para ver y compartir contenido multimedia."
                  }
                </p>
                {showUpload && (
                  <Button 
                    onClick={() => setShowUploadDialog(true)}
                    className="btn-equestrian"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir primer archivo
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="albums" className="space-y-6">
            {albums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <AlbumCard 
                    key={album.id} 
                    album={album}
                    currentUser={currentUser}
                    onUpdate={() => {
                      // Refresh albums
                      // This would fetch updated albums
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ImageIcon className="mx-auto h-24 w-24 text-muted-foreground mb-6 opacity-50" />
                <h3 className="text-2xl font-bold mb-4">No hay álbumes</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Los álbumes te permiten organizar tus fotos y videos por temas.
                </p>
                {showUpload && (
                  <Button 
                    onClick={() => setShowUploadDialog(true)}
                    className="btn-equestrian"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer álbum
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
              <span>Cargando contenido multimedia...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
