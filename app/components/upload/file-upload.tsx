
'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Upload,
  X,
  FileImage,
  FileVideo,
  File,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { FileUploadProgress, UploadOptions } from '@/lib/types'
import { useSupabase } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUploadComplete?: (files: any[]) => void
  onUploadProgress?: (progress: FileUploadProgress[]) => void
  options?: UploadOptions
  className?: string
  showAlbumCreation?: boolean
  preselectedCategory?: string
}

export function FileUpload({
  onUploadComplete,
  onUploadProgress,
  options = {},
  className,
  showAlbumCreation = false,
  preselectedCategory
}: FileUploadProps) {
  const { supabase } = useSupabase()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // Form state
  const [category, setCategory] = useState(preselectedCategory || options.category || 'gallery')
  const [isPublic, setIsPublic] = useState(options.isPublic !== false)
  const [tags, setTags] = useState<string[]>(options.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [generateThumbnails, setGenerateThumbnails] = useState(options.generateThumbnail !== false)
  
  // Album creation state
  const [createAlbum, setCreateAlbum] = useState(false)
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumDescription, setAlbumDescription] = useState('')

  const {
    maxFiles = 10,
    maxSize = 50 * 1024 * 1024, // 50MB
    acceptedTypes = ['image/*', 'video/*']
  } = options

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : []
    addFiles(selectedFiles)
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`)
        return false
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/')
        if (type === 'video/*') return file.type.startsWith('video/')
        return file.type === type
      })

      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`)
        return false
      }

      return true
    })

    setFiles(prev => {
      const combined = [...prev, ...validFiles]
      if (combined.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed. Only the first ${maxFiles} files will be kept.`)
        return combined.slice(0, maxFiles)
      }
      return combined
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage
    if (mimeType.startsWith('video/')) return FileVideo
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    if (createAlbum && !albumTitle.trim()) {
      toast.error('Please enter an album title')
      return
    }

    setIsUploading(true)
    setUploadProgress([])

    try {
      // Initialize progress tracking
      const initialProgress = files.map(file => ({
        filename: file.name,
        progress: 0,
        status: 'uploading' as const
      }))
      setUploadProgress(initialProgress)
      onUploadProgress?.(initialProgress)

      // Prepare form data
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('category', category)
      formData.append('isPublic', isPublic.toString())
      formData.append('tags', JSON.stringify(tags))
      formData.append('generateThumbnails', generateThumbnails.toString())

      // Upload files
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Upload failed')
      }

      const uploadResult = await uploadResponse.json()

      // Update progress
      const completedProgress = files.map(file => ({
        filename: file.name,
        progress: 100,
        status: 'completed' as const
      }))
      setUploadProgress(completedProgress)
      onUploadProgress?.(completedProgress)

      // Create album if requested
      let albumId: string | undefined
      if (createAlbum && uploadResult.files.length > 0) {
        const successfulUploads = uploadResult.files.filter((f: any) => f.upload_status === 'completed')
        
        if (successfulUploads.length > 0) {
          const albumResponse = await fetch('/api/albums', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: albumTitle,
              description: albumDescription,
              category,
              isPublic,
              tags
            })
          })

          if (albumResponse.ok) {
            const albumResult = await albumResponse.json()
            albumId = albumResult.album.id

            // Add files to album
            await fetch(`/api/albums/${albumId}/media`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                mediaIds: successfulUploads.map((f: any) => f.id)
              })
            })

            toast.success(`Album "${albumTitle}" created with ${successfulUploads.length} files`)
          }
        }
      }

      toast.success(`Successfully uploaded ${uploadResult.uploaded_count} file(s)`)
      
      // Reset form
      setFiles([])
      setCreateAlbum(false)
      setAlbumTitle('')
      setAlbumDescription('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onUploadComplete?.(uploadResult.files)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      
      // Update progress to show error
      const errorProgress = files.map(file => ({
        filename: file.name,
        progress: 0,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
      setUploadProgress(errorProgress)
      onUploadProgress?.(errorProgress)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className={cn("horse-shadow", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5 text-amber-600" />
          Subir Archivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragActive ? "border-amber-500 bg-amber-50 dark:bg-amber-950" : "border-muted-foreground/25",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </h3>
          <p className="text-muted-foreground text-sm">
            Máximo {maxFiles} archivos, {Math.round(maxSize / 1024 / 1024)}MB cada uno
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Formatos soportados: Imágenes y Videos
          </p>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Archivos seleccionados ({files.length})</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => {
                const IconComponent = getFileIcon(file.type)
                const progress = uploadProgress.find(p => p.filename === file.name)
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <IconComponent className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        {progress && progress.status === 'uploading' && (
                          <Progress value={progress.progress} className="h-2 mt-1" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {progress && (
                        <div className="flex items-center">
                          {progress.status === 'completed' && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {progress.status === 'failed' && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          {progress.status === 'uploading' && (
                            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          )}
                        </div>
                      )}
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upload Options */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hall_of_fame">Hall of Fame</SelectItem>
                <SelectItem value="gallery">Galería</SelectItem>
                <SelectItem value="events">Eventos</SelectItem>
                <SelectItem value="training">Entrenamiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                disabled={isUploading}
              />
              <Label htmlFor="isPublic" className="text-sm">Público</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generateThumbnails"
                checked={generateThumbnails}
                onCheckedChange={(checked) => setGenerateThumbnails(checked as boolean)}
                disabled={isUploading}
              />
              <Label htmlFor="generateThumbnails" className="text-sm">Miniaturas</Label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Etiquetas</Label>
          <div className="flex space-x-2 mb-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Añadir etiqueta..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              disabled={isUploading}
            />
            <Button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || isUploading}
              variant="outline"
            >
              Añadir
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  {!isUploading && (
                    <X
                      className="ml-1 h-3 w-3"
                      onClick={() => removeTag(tag)}
                    />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Album Creation */}
        {showAlbumCreation && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createAlbum"
                checked={createAlbum}
                onCheckedChange={(checked) => setCreateAlbum(checked as boolean)}
                disabled={isUploading}
              />
              <Label htmlFor="createAlbum">Crear nuevo álbum con estos archivos</Label>
            </div>

            {createAlbum && (
              <div className="space-y-4 pl-6 border-l-2 border-amber-200">
                <div>
                  <Label htmlFor="albumTitle">Título del álbum *</Label>
                  <Input
                    id="albumTitle"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Título del álbum..."
                    disabled={isUploading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="albumDescription">Descripción del álbum</Label>
                  <Textarea
                    id="albumDescription"
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    placeholder="Descripción opcional del álbum..."
                    disabled={isUploading}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading || (createAlbum && !albumTitle.trim())}
          className="w-full btn-equestrian"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo archivos...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir {files.length > 0 ? `${files.length} archivo${files.length > 1 ? 's' : ''}` : 'Archivos'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
