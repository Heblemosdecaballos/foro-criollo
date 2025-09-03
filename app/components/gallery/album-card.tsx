
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
  Eye,
  MoreHorizontal,
  Trash2,
  Edit,
  Image as ImageIcon,
  Clock,
  Users,
  Lock
} from 'lucide-react'
import { MediaAlbum } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

interface AlbumCardProps {
  album: MediaAlbum
  currentUser: any
  onUpdate?: () => void
}

export function AlbumCard({ album, currentUser, onUpdate }: AlbumCardProps) {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (album.cover_image && album.cover_image.cloud_storage_path) {
        try {
          const response = await fetch(`/api/media/${album.cover_image.id}/url`)
          if (response.ok) {
            const data = await response.json()
            setCoverImageUrl(data.thumbnail_url || data.url)
          }
        } catch (error) {
          console.error('Error fetching cover image:', error)
        }
      }
      setIsLoading(false)
    }

    fetchCoverImage()
  }, [album.cover_image])

  const isOwner = currentUser?.id === album.created_by

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este álbum?')) {
      return
    }

    try {
      const response = await fetch(`/api/albums/${album.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Álbum eliminado correctamente')
        onUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el álbum')
      }
    } catch (error) {
      console.error('Error deleting album:', error)
      toast.error('Error al eliminar el álbum')
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'hall_of_fame': return 'Hall of Fame'
      case 'gallery': return 'Galería'
      case 'events': return 'Eventos'
      case 'training': return 'Entrenamiento'
      default: return 'General'
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'hall_of_fame': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'gallery': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'events': return 'bg-green-100 text-green-800 border-green-200'
      case 'training': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Link href={`/galeria/albums/${album.id}`} className="group block">
      <Card className="horse-shadow card-hover border-0 shadow-md group-hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {isLoading ? (
            <div className="w-full h-full bg-muted animate-pulse" />
          ) : coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={album.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 to-orange-900 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-amber-600" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            <Badge className={`text-xs ${getCategoryColor(album.category)}`}>
              {getCategoryLabel(album.category)}
            </Badge>
            {!album.is_public && (
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800">
                <Lock className="mr-1 h-3 w-3" />
                Privado
              </Badge>
            )}
          </div>

          {/* Media count */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-800 text-xs">
              {album.media_count || 0} archivo{(album.media_count || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/galeria/albums/${album.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver álbum
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/galeria/albums/${album.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete()
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
            {album.title}
          </h3>
          
          {album.creator && (
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={album.creator.avatar_url} />
                <AvatarFallback className="text-xs">
                  {album.creator.name?.charAt(0) || album.creator.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Por {album.creator.name || 'Usuario'}
              </span>
            </div>
          )}
          
          {album.description && (
            <p className="text-sm line-clamp-2 text-gray-600 dark:text-gray-400 mb-3">
              {album.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Eye className="mr-1 h-3 w-3" />
                {album.view_count} vista{album.view_count !== 1 ? 's' : ''}
              </div>
              {album.is_public && (
                <div className="flex items-center">
                  <Users className="mr-1 h-3 w-3" />
                  Público
                </div>
              )}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {formatRelativeDate(album.created_at)}
            </div>
          </div>

          {/* Tags */}
          {album.tags && album.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {album.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {album.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{album.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
