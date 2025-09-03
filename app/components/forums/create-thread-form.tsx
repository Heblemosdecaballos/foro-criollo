
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageSquare, Hash, Type, FileText } from 'lucide-react'
import { useSupabase } from '@/components/providers'

interface CreateThreadFormProps {
  categories: Array<{
    slug: string
    name: string
    description: string
  }>
}

export function CreateThreadForm({ categories }: CreateThreadFormProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.category || !formData.content.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    if (formData.title.length < 5) {
      setError('El título debe tener al menos 5 caracteres')
      return
    }

    if (formData.content.length < 20) {
      setError('El contenido debe tener al menos 20 caracteres')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // For demo purposes, just redirect to the category
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      // Simulate successful creation
      setTimeout(() => {
        router.push(`/forums/${formData.category}/${slug}`)
      }, 1000)

    } catch (err: any) {
      setError(err.message || 'Error inesperado. Inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título del tema</Label>
          <div className="relative mt-1">
            <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Escribe un título descriptivo..."
              value={formData.title}
              onChange={handleInputChange}
              disabled={isLoading}
              className="pl-10"
              maxLength={100}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.title.length}/100 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <div className="relative mt-1">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Select value={formData.category} onValueChange={handleCategoryChange} disabled={isLoading}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="content">Contenido</Label>
          <div className="relative mt-1">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="content"
              name="content"
              placeholder="Escribe el contenido de tu tema aquí..."
              value={formData.content}
              onChange={handleInputChange}
              disabled={isLoading}
              className="pl-10 min-h-[200px]"
              maxLength={5000}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.content.length}/5000 caracteres
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="btn-equestrian flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando tema...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              Crear tema (Demo)
            </>
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>

      <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
        <strong>Nota:</strong> Esta es una versión de demostración. Para habilitar la funcionalidad completa,
        configura las credenciales de Supabase en las variables de entorno.
      </div>
    </form>
  )
}
