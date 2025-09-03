
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaFile {
  id: string
  filename: string
  cloud_storage_path: string
  mime_type: string
  width?: number
  height?: number
  alt_text?: string
  description?: string
}

interface HorseMedia {
  id: string
  media_id: string
  is_cover: boolean
  caption?: string
  order_index: number
  media_files: MediaFile
}

interface HorseGalleryProps {
  media: HorseMedia[]
  horseName: string
}

export function HorseGallery({ media, horseName }: HorseGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!media || media.length === 0) {
    return null
  }

  const sortedMedia = [...media].sort((a, b) => a.order_index - b.order_index)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setIsLightboxOpen(true)
  }

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % sortedMedia.length)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length)
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedMedia.map((mediaItem, index) => {
          const { media_files: file } = mediaItem
          const isVideo = file.mime_type.startsWith('video/')
          
          return (
            <div
              key={mediaItem.id}
              className="relative group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                {isVideo ? (
                  <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                    <video
                      src={file.cloud_storage_path}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                      muted
                      playsInline
                    />
                  </div>
                ) : (
                  <Image
                    src={file.cloud_storage_path}
                    alt={file.alt_text || mediaItem.caption || `${horseName} - Imagen ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg" />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {mediaItem.is_cover && (
                  <Badge className="bg-amber-600 text-white text-xs">
                    Principal
                  </Badge>
                )}
                {isVideo && (
                  <Badge variant="secondary" className="text-xs">
                    Video
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {sortedMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-16 z-10 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Media Display */}
            <div className="w-full h-full flex items-center justify-center p-8">
              {sortedMedia[selectedIndex] && (() => {
                const currentMedia = sortedMedia[selectedIndex]
                const file = currentMedia.media_files
                const isVideo = file.mime_type.startsWith('video/')
                
                return (
                  <div className="relative max-w-full max-h-full">
                    {isVideo ? (
                      <video
                        src={file.cloud_storage_path}
                        controls
                        autoPlay
                        className="max-w-full max-h-full"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto'
                        }}
                      />
                    ) : (
                      <Image
                        src={file.cloud_storage_path}
                        alt={file.alt_text || currentMedia.caption || `${horseName} - Imagen ${selectedIndex + 1}`}
                        width={file.width || 800}
                        height={file.height || 600}
                        className="max-w-full max-h-full object-contain"
                        priority
                      />
                    )}
                    
                    {/* Caption */}
                    {currentMedia.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                        <p className="text-sm">{currentMedia.caption}</p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Counter */}
            {sortedMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                {selectedIndex + 1} / {sortedMedia.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
