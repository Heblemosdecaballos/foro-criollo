
'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  Video,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onUploadComplete: (files: any[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number // in bytes
  multiple?: boolean
  className?: string
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
  result?: any
}

export function FileUpload({
  onUploadComplete,
  accept = "image/*,video/*",
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = true,
  className
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon
    if (file.type.startsWith('video/')) return Video
    return File
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `El archivo es muy grande. Máximo permitido: ${formatFileSize(maxSize)}`
    }

    const acceptedTypes = accept.split(',').map(type => type.trim())
    const isAccepted = acceptedTypes.some(type => {
      if (type === '*') return true
      if (type.endsWith('/*')) {
        const baseType = type.slice(0, -2)
        return file.type.startsWith(baseType)
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''))
    })

    if (!isAccepted) {
      return `Tipo de archivo no permitido. Permitidos: ${accept}`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al subir archivo')
    }

    return response.json()
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    const filesArray = Array.from(files)
    
    // Check max files limit
    const currentCount = uploadingFiles.filter(f => f.status === 'completed').length
    const totalCount = currentCount + filesArray.length
    
    if (totalCount > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    // Validate files
    const validFiles = filesArray.filter(file => {
      const error = validateFile(file)
      if (error) {
        toast.error(`${file.name}: ${error}`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      progress: 0,
      status: 'uploading' as const
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Upload files
    const uploadPromises = newUploadingFiles.map(async (uploadingFile) => {
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(f => 
            f.id === uploadingFile.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          ))
        }, 200)

        const result = await uploadFile(uploadingFile.file)
        
        clearInterval(progressInterval)

        setUploadingFiles(prev => prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, progress: 100, status: 'completed' as const, result }
            : f
        ))

        return result
      } catch (error) {
        setUploadingFiles(prev => prev.map(f =>
          f.id === uploadingFile.id
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Error desconocido'
              }
            : f
        ))
        throw error
      }
    })

    try {
      const results = await Promise.allSettled(uploadPromises)
      const successful = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)

      if (successful.length > 0) {
        onUploadComplete(successful)
        toast.success(`${successful.length} archivo(s) subido(s) exitosamente`)
      }

      const failed = results.filter(result => result.status === 'rejected').length
      if (failed > 0) {
        toast.error(`${failed} archivo(s) fallaron al subir`)
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Error al subir archivos')
    }
  }, [uploadingFiles, maxFiles, onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  const retryUpload = (id: string) => {
    const file = uploadingFiles.find(f => f.id === id)
    if (file) {
      setUploadingFiles(prev => prev.map(f =>
        f.id === id
          ? { ...f, status: 'uploading' as const, progress: 0, error: undefined }
          : f
      ))
      
      // Retry upload
      handleFileUpload(new DataTransfer().files)
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver 
            ? "border-amber-500 bg-amber-50 dark:bg-amber-950" 
            : "border-gray-300 dark:border-gray-700 hover:border-amber-400"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="py-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? 'Suelta los archivos aquí' : 'Subir archivos'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Arrastra y suelta archivos aquí, o haz clic para seleccionar
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Máximo {maxFiles} archivos, {formatFileSize(maxSize)} por archivo</p>
            <p>Tipos permitidos: {accept}</p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Archivos:</h4>
          {uploadingFiles.map((uploadingFile) => {
            const IconComponent = getFileIcon(uploadingFile.file)
            
            return (
              <Card key={uploadingFile.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">
                        {uploadingFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {uploadingFile.status === 'uploading' && (
                          <LoadingSpinner size="sm" />
                        )}
                        {uploadingFile.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {uploadingFile.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadingFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{formatFileSize(uploadingFile.file.size)}</span>
                      <Badge variant={
                        uploadingFile.status === 'completed' ? 'default' :
                        uploadingFile.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {uploadingFile.status === 'uploading' ? 'Subiendo...' :
                         uploadingFile.status === 'completed' ? 'Completado' :
                         'Error'}
                      </Badge>
                    </div>
                    
                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} className="h-2" />
                    )}
                    
                    {uploadingFile.error && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-red-600">{uploadingFile.error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload(uploadingFile.id)}
                          className="text-xs"
                        >
                          Reintentar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
