
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Play,
  Heart,
  MessageCircle,
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit,
  FileImage,
  FileVideo,
  Clock
} from 'lucide-react'
import { MediaFile } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'
import Image from 'next/image'
import { toast } from 'sonner'

interface MediaCardProps {
  media: MediaFile
  viewMode: 'grid' | 'list'
  currentUser: any
  onUpdate?: () => void
}

export function MediaCard({ media, viewMode, currentUser, onUpdate }: MediaCardProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFullImage, setShowFullImage] = useState(false)

  useEffect(() => {
    const fetchMediaUrl = async () => {
      try {
        const response = await fetch(`/api/media/${media.id}/url`)
        if (response.ok) {
          const data = await response.json()
          setMediaUrl(data.url)
          if (data.thumbnail_url) {
            setThumbnailUrl(data.thumbnail_url)
          }
        }
      } catch (error) {
        console.error('Error fetching media URL:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMediaUrl()
  }, [media.id])

  const isImage = media.mime_type.startsWith('image/')
  const isVideo = media.mime_type.startsWith('video/')
  const isOwner = currentUser?.id === media.uploaded_by

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      return
    }

    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: media.id })
      })

      if (response.ok) {
        toast.success('Archivo eliminado correctamente')
        onUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el archivo')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      toast.error('Error al eliminar el archivo')
    }
  }

  const handleShare = async () => {
    if (navigator.share && mediaUrl) {
      try {
        await navigator.share({
          title: media.original_filename,
          text: media.description || `Compartiendo: ${media.original_filename}`,
          url: mediaUrl
        })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(mediaUrl)
        toast.success('URL copiada al portapapeles')
      }
    } else if (mediaUrl) {
      await navigator.clipboard.writeText(mediaUrl)
      toast.success('URL copiada al portapapeles')
    }
  }

  const handleDownload = () => {
    if (mediaUrl) {
      const link = document.createElement('a')
      link.href = mediaUrl
      link.download = media.original_filename
      link.click()
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="horse-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="w-full h-full bg-muted animate-pulse" />
                ) : (thumbnailUrl || mediaUrl) ? (
                  <Image
                    src={thumbnailUrl || mediaUrl || ''}
                    alt={media.alt_text || media.original_filename}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isImage ? (
                      <FileImage className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <FileVideo className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                )}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-1">
                      <Play className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">
                    {media.original_filename}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {media.uploader && (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={media.uploader.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {media.uploader.name?.charAt(0) || media.uploader.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {media.uploader.name || 'Usuario'}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(media.file_size)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(media.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {isImage ? 'Imagen' : 'Video'}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowFullImage(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartir
                      </DropdownMenuItem>
                      {isOwner && (
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <>
      <Card className="horse-shadow group cursor-pointer" onClick={() => setShowFullImage(true)}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {isLoading ? (
            <div className="w-full h-full bg-muted animate-pulse" />
          ) : (thumbnailUrl || mediaUrl) ? (
            <Image
              src={thumbnailUrl || mediaUrl || ''}
              alt={media.alt_text || media.original_filename}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 to-orange-900 flex items-center justify-center">
              {isImage ? (
                <FileImage className="h-16 w-16 text-amber-600" />
              ) : (
                <FileVideo className="h-16 w-16 text-amber-600" />
              )}
            </div>
          )}

          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex space-x-1">
            <Badge variant="secondary" className="text-xs">
              {isImage ? 'IMG' : 'VID'}
            </Badge>
            {!media.is_public && (
              <Badge variant="outline" className="text-xs">
                Privado
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowFullImage(true) }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload() }}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare() }}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); handleDelete() }}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-1">
            {media.original_filename}
          </h3>
          
          {media.uploader && (
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={media.uploader.avatar_url} />
                <AvatarFallback className="text-xs">
                  {media.uploader.name?.charAt(0) || media.uploader.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {media.uploader.name || 'Usuario'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(media.file_size)}</span>
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {formatRelativeDate(media.created_at)}
            </div>
          </div>

          {/* Tags */}
          {media.tags && media.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {media.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {media.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{media.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Image/Video Dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            {mediaUrl && (
              <>
                {isImage ? (
                  <div className="relative aspect-video max-h-[70vh]">
                    <Image
                      src={mediaUrl}
                      alt={media.alt_text || media.original_filename}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full max-h-[70vh]"
                    preload="metadata"
                  />
                )}
              </>
            )}
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{media.original_filename}</h3>
              {media.description && (
                <p className="text-muted-foreground">{media.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {media.uploader && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={media.uploader.avatar_url} />
                      <AvatarFallback>
                        {media.uploader.name?.charAt(0) || media.uploader.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{media.uploader.name || 'Usuario'}</span>
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatRelativeDate(media.created_at)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{formatFileSize(media.file_size)}</span>
              {media.width && media.height && (
                <span>{media.width} × {media.height}</span>
              )}
              <span>{media.mime_type}</span>
            </div>

            {media.tags && media.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {media.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
