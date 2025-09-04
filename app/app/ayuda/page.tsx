
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import {
  HelpCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  Play,
  MessageSquare,
  Trophy,
  ShoppingCart,
  ImageIcon,
  Award,
  User,
  Settings,
  BookOpen,
  Video,
  FileText
} from 'lucide-react'
import { FAQ_CATEGORIES } from '@/lib/constants'

// Mock FAQ data
const mockFAQs = [
  {
    id: '1',
    category_id: 'primeros-pasos',
    question: '¿Cómo me registro en la plataforma?',
    answer: `Para registrarte en Hablando de Caballos, sigue estos pasos:

1. **Haz clic en "Registrarse"** en la esquina superior derecha
2. **Completa el formulario** con tu información personal
3. **Verifica tu email** haciendo clic en el enlace que te enviamos
4. **Completa tu perfil** agregando información sobre tu experiencia ecuestre

Una vez registrado, podrás participar en foros, agregar caballos al Hall of Fame y usar el marketplace.`,
    slug: 'como-me-registro',
    is_featured: true,
    helpful_votes: 25,
    not_helpful_votes: 2
  },
  {
    id: '2',
    category_id: 'foros-y-discusiones',
    question: '¿Cómo creo un nuevo tema en el foro?',
    answer: `Para crear un nuevo tema en el foro:

1. **Ve a la sección de Foros** desde el menú principal
2. **Selecciona la categoría apropiada** (Razas y cría, Cuidados y salud, etc.)
3. **Haz clic en "Crear tema"**
4. **Escribe un título descriptivo** y el contenido de tu tema
5. **Puedes agregar imágenes** arrastrando archivos o usando el botón de subida
6. **Publica tu tema** y espera las respuestas de la comunidad

Recuerda seguir las reglas de la comunidad y ser respetuoso con otros miembros.`,
    slug: 'como-crear-tema-foro',
    is_featured: true,
    helpful_votes: 18,
    not_helpful_votes: 1
  },
  {
    id: '3',
    category_id: 'hall-of-fame',
    question: '¿Qué requisitos debe cumplir un caballo para el Hall of Fame?',
    answer: `Para agregar un caballo al Hall of Fame debe cumplir estos requisitos:

**Requisitos básicos:**
- Ser un caballo criollo colombiano
- Tener información completa de pedigree (opcional pero recomendado)
- Fotos de calidad que muestren claramente al ejemplar

**Información requerida:**
- Nombre del caballo
- Andar (Paso Fino, Trocha, Trocha y Galope, Trote y Galope)
- Descripción detallada
- Al menos una foto de buena calidad

**Consejos para destacar:**
- Agrega múltiples fotos desde diferentes ángulos
- Incluye información sobre logros y competencias
- Menciona características especiales del ejemplar`,
    slug: 'requisitos-hall-of-fame',
    is_featured: true,
    helpful_votes: 32,
    not_helpful_votes: 3
  },
  {
    id: '4',
    category_id: 'marketplace',
    question: '¿Cómo publico un anuncio en el marketplace?',
    answer: `Para publicar un anuncio en el marketplace:

1. **Ve al Marketplace** desde el menú principal
2. **Haz clic en "Publicar anuncio"**
3. **Selecciona la categoría** apropiada
4. **Completa la información:**
   - Título descriptivo
   - Descripción detallada
   - Precio (en COP)
   - Ubicación
   - Información de contacto
5. **Agrega fotos** de alta calidad
6. **Revisa y publica** tu anuncio

**Consejos importantes:**
- Usa fotos claras y bien iluminadas
- Sé honesto en la descripción
- Responde rápidamente a los interesados
- Mantén tu anuncio actualizado`,
    slug: 'como-publicar-anuncio',
    is_featured: false,
    helpful_votes: 15,
    not_helpful_votes: 0
  }
]

const mockTutorials = [
  {
    id: '1',
    title: 'Cómo subir tu primer caballo al Hall of Fame',
    description: 'Tutorial paso a paso para agregar tu primer ejemplar',
    type: 'video',
    duration: '5 min',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Puerto_rican-Paso-Fino-Horse-chestnut.jpg'
  },
  {
    id: '2',
    title: 'Participar en discusiones del foro',
    description: 'Aprende a crear temas, responder y usar el editor',
    type: 'guide',
    duration: '3 min',
    thumbnail: null
  },
  {
    id: '3',
    title: 'Crear encuestas en tus temas',
    description: 'Guía para crear encuestas interactivas',
    type: 'tutorial',
    duration: '4 min',
    thumbnail: null
  }
]

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || faq.category_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const featuredFAQs = mockFAQs.filter(faq => faq.is_featured)

  const handleVote = (faqId: string, isHelpful: boolean) => {
    // Mock vote handler - in real app would update database
    console.log(`Voting ${isHelpful ? 'helpful' : 'not helpful'} for FAQ ${faqId}`)
  }

  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      'Play': Play,
      'MessageSquare': MessageSquare,
      'Trophy': Trophy,
      'ShoppingCart': ShoppingCart,
      'Image': ImageIcon,
      'Award': Award,
      'User': User,
      'Settings': Settings
    }
    return icons[iconName] || HelpCircle
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Centro de Ayuda
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Ayuda y{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Soporte
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
            Encuentra respuestas a tus preguntas y aprende a aprovechar al máximo 
            todas las funcionalidades de la plataforma.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="horse-shadow mb-8">
          <CardContent className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Busca tu pregunta aquí..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
            <TabsTrigger value="tutorials">Tutoriales</TabsTrigger>
            <TabsTrigger value="guides">Guías</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            {/* Featured FAQs */}
            {searchQuery === '' && selectedCategory === 'all' && (
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-amber-600" />
                    Preguntas más populares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredFAQs.map((faq) => (
                      <Card key={faq.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                            {faq.question}
                          </h3>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {FAQ_CATEGORIES.find(cat => cat.slug === faq.category_id)?.name}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{faq.helpful_votes}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="horse-shadow sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Categorías</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        selectedCategory === 'all' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' : 'hover:bg-accent'
                      }`}
                    >
                      Todas las categorías
                    </button>
                    {FAQ_CATEGORIES.map((category) => {
                      const IconComponent = getCategoryIcon(category.icon)
                      return (
                        <button
                          key={category.slug}
                          onClick={() => setSelectedCategory(category.slug)}
                          className={`w-full text-left p-2 rounded-md text-sm transition-colors flex items-center space-x-2 ${
                            selectedCategory === category.slug ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' : 'hover:bg-accent'
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{category.name}</span>
                        </button>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-3">
                <Card className="horse-shadow">
                  <CardHeader>
                    <CardTitle>
                      {searchQuery ? `Resultados para "${searchQuery}"` : 
                       selectedCategory === 'all' ? 'Todas las preguntas frecuentes' :
                       FAQ_CATEGORIES.find(cat => cat.slug === selectedCategory)?.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {filteredFAQs.length} preguntas encontradas
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-4">
                      {filteredFAQs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">{faq.question}</span>
                              <Badge variant="outline" className="ml-2">
                                {FAQ_CATEGORIES.find(cat => cat.slug === faq.category_id)?.name}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 pb-6">
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-line text-muted-foreground mb-4">
                                {faq.answer}
                              </div>
                            </div>
                            
                            {/* Vote buttons */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <p className="text-sm text-muted-foreground">¿Te resultó útil esta respuesta?</p>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVote(faq.id, true)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Sí ({faq.helpful_votes})
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVote(faq.id, false)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  No ({faq.not_helpful_votes})
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    {filteredFAQs.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                        <p className="text-muted-foreground">
                          Intenta con diferentes palabras clave o explora las categorías.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="horse-shadow hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    {tutorial.thumbnail ? (
                      <Image
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 to-orange-900 flex items-center justify-center">
                        {tutorial.type === 'video' ? <Video className="h-16 w-16 text-amber-600" /> :
                         tutorial.type === 'guide' ? <BookOpen className="h-16 w-16 text-amber-600" /> :
                         <FileText className="h-16 w-16 text-amber-600" />}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/70 text-white">
                        {tutorial.duration}
                      </Badge>
                    </div>
                    {tutorial.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary" className="capitalize">
                        {tutorial.type}
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700">
                        Ver {tutorial.type === 'video' ? 'video' : 'guía'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="horse-shadow mt-8">
              <CardContent className="text-center py-8">
                <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-md">
                  <Video className="h-4 w-4" />
                  <span>Tutoriales de demostración - Próximamente contenido real</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides">
            <div className="grid gap-6">
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle>Guías de inicio rápido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold">🚀 Para nuevos usuarios</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Crea tu cuenta y completa tu perfil</li>
                        <li>• Explora las diferentes secciones</li>
                        <li>• Únete a tu primera discusión</li>
                        <li>• Sube tu primer caballo al Hall of Fame</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">💼 Para vendedores</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Configura tu perfil profesional</li>
                        <li>• Publica tu primer anuncio</li>
                        <li>• Optimiza tus fotos y descripciones</li>
                        <li>• Gestiona tus ventas y contactos</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle>Código de conducta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    En Hablando de Caballos promovemos un ambiente respetuoso y colaborativo. 
                    Sigue estas pautas para mantener nuestra comunidad saludable:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-green-600">✅ Está permitido</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Compartir conocimientos y experiencias</li>
                        <li>• Hacer preguntas constructivas</li>
                        <li>• Publicar contenido relevante al tema ecuestre</li>
                        <li>• Respetar opiniones diferentes</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-red-600">❌ No está permitido</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Spam o contenido promocional excesivo</li>
                        <li>• Lenguaje ofensivo o discriminatorio</li>
                        <li>• Información falsa o engañosa</li>
                        <li>• Acoso a otros miembros</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="horse-shadow mt-8">
          <CardContent className="text-center py-8">
            <HelpCircle className="mx-auto h-16 w-16 text-amber-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">¿No encontraste lo que buscabas?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Nuestro equipo de soporte está listo para ayudarte con cualquier pregunta específica.
            </p>
            <Button className="btn-equestrian">
              Contactar soporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
