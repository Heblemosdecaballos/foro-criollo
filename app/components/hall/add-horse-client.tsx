
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/ui/file-upload'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Plus, X, Calendar, Ruler, Palette, Trophy, ArrowLeft } from 'lucide-react'
import { ANDARES } from '@/lib/constants'
import { createSlug } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export function AddHorseClient() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const [formData, setFormData] = useState({
    name: '',
    andar_slug: '',
    description: '',
    pedigree_url: '',
    owner_name: '',
    birth_date: '',
    color: '',
    height_cm: '',
    awards: ['']
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAwardChange = (index: number, value: string) => {
    const newAwards = [...formData.awards]
    newAwards[index] = value
    setFormData(prev => ({ ...prev, awards: newAwards }))
  }

  const addAward = () => {
    setFormData(prev => ({ 
      ...prev, 
      awards: [...prev.awards, ''] 
    }))
  }

  const removeAward = (index: number) => {
    if (formData.awards.length > 1) {
      const newAwards = formData.awards.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, awards: newAwards }))
    }
  }

  const handleFileUploadComplete = (files: any[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      toast.error('Debes iniciar sesión para agregar un caballo')
      return
    }

    if (!formData.name || !formData.andar_slug) {
      toast.error('El nombre y el andar son obligatorios')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        awards: formData.awards.filter(award => award.trim() !== ''),
        media_ids: uploadedFiles.map(f => f.id)
      }

      const response = await fetch('/api/horses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear el caballo')
      }

      const { data: horse } = await response.json()
      toast.success('¡Caballo agregado exitosamente!')
      
      // Redirect to horse detail page
      router.push(`/hall/${horse.andar_slug}/${horse.slug}`)
    } catch (error) {
      console.error('Error creating horse:', error)
      toast.error(error instanceof Error ? error.message : 'Error al agregar el caballo')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while mounting or session loading
  if (!isMounted || status === 'loading') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="horse-shadow">
          <CardContent className="text-center py-12">
            <Trophy className="mx-auto h-16 w-16 text-amber-600 mb-4" />
            <LoadingSpinner className="mx-auto" />
            <p className="text-muted-foreground mt-4">
              Verificando sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login required if no session
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="horse-shadow">
          <CardContent className="text-center py-12">
            <Trophy className="mx-auto h-16 w-16 text-amber-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Iniciar sesión requerido</h3>
            <p className="text-muted-foreground mb-6">
              Debes iniciar sesión para agregar caballos al Hall of Fame.
            </p>
            <Link href="/auth/login">
              <Button className="btn-equestrian">
                Iniciar sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/hall">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Hall of Fame
          </Button>
        </Link>
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <Plus className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Agregar nuevo ejemplar
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Nuevo caballo al{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Hall of Fame
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comparte un ejemplar excepcional de caballo criollo colombiano con nuestra comunidad.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="horse-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-amber-600" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nombre del caballo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Majestuoso del Valle"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="andar">Andar *</Label>
                <Select value={formData.andar_slug} onValueChange={(value) => handleInputChange('andar_slug', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el andar" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANDARES.map((andar) => (
                      <SelectItem key={andar.slug} value={andar.slug}>
                        {andar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe las características destacadas de este ejemplar..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="horse-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-amber-600" />
              Detalles adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="owner_name">Nombre del propietario</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              
              <div>
                <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Ej: Alazán tostao"
                />
              </div>
              
              <div>
                <Label htmlFor="height_cm">Alzada (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => handleInputChange('height_cm', e.target.value)}
                  placeholder="Ej: 148"
                  min="120"
                  max="180"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pedigree_url">URL del pedigree</Label>
              <Input
                id="pedigree_url"
                type="url"
                value={formData.pedigree_url}
                onChange={(e) => handleInputChange('pedigree_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Awards */}
        <Card className="horse-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-amber-600" />
                Premios y reconocimientos
              </div>
              <Button type="button" onClick={addAward} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.awards.map((award, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={award}
                  onChange={(e) => handleAwardChange(index, e.target.value)}
                  placeholder="Ej: Campeón Nacional Paso Fino 2023"
                />
                {formData.awards.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeAward(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card className="horse-shadow">
          <CardHeader>
            <CardTitle>Imágenes y videos</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUploadComplete={handleFileUploadComplete}
              accept="image/*,video/*"
              maxFiles={10}
              multiple
            />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Archivos subidos:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {file.mime_type?.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl mb-2">🎥</div>
                              <p className="text-sm text-muted-foreground">Video</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-amber-600">
                          Imagen principal
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            className="btn-equestrian"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Agregando caballo...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Agregar al Hall of Fame
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
