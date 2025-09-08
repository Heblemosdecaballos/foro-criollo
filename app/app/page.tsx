
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  Trophy,
  MessageSquare,
  ImageIcon,
  Users,
  ArrowRight,
  ChevronRight,
  Heart,
  BookOpen
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 dark:from-amber-900/40 dark:to-orange-900/40"></div>
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center space-y-8">
            <div className="flex justify-center flex-col items-center space-y-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image
                  src="/paso-fino-colombiano.png"
                  alt="Caballo Criollo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-[#4B2E2E] dark:text-white">
                Hablando de Caballos
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                La plataforma más completa para amantes de los caballos criollos. 
                Descubre ejemplares excepcionales, participa en discusiones especializadas 
                y conecta con la comunidad ecuestre más apasionada.
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <div className="relative w-32 h-48 md:w-40 md:h-60">
                <Image 
                  src="/paso-fino-colombiano.png" 
                  alt="Caballo Paso Fino Colombiano" 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Link href="/hall">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3">
                  <Trophy className="mr-2 h-5 w-5" />
                  Hall de la Fama
                </Button>
              </Link>
              <Link href="/forums">
                <Button size="lg" variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold px-8 py-3">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Únete al Foro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#4B2E2E] dark:text-white mb-4">
              Explora Nuestra Plataforma
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubre todas las herramientas y recursos que hemos creado para la comunidad ecuestre
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#4B2E2E] dark:text-white">Hall de la Fama</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  Conoce los ejemplares excepcionales de los cuatro andares del caballo criollo colombiano
                </CardDescription>
                <div className="mt-4 text-center">
                  <Link href="/hall" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium">
                    Explorar <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#4B2E2E] dark:text-white">Foros de Discusión</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  Participa en conversaciones sobre cuidado, entrenamiento y experiencias ecuestres
                </CardDescription>
                <div className="mt-4 text-center">
                  <Link href="/forums" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    Participar <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#4B2E2E] dark:text-white">Galería Equina</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  Comparte y descubre imágenes de caballos, eventos y momentos especiales
                </CardDescription>
                <div className="mt-4 text-center">
                  <Link href="/galeria" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
                    Ver Galería <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#4B2E2E] dark:text-white">Historias</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  Lee artículos fascinantes sobre la historia y cultura del mundo ecuestre
                </CardDescription>
                <div className="mt-4 text-center">
                  <Link href="/historias" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium">
                    Leer Más <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#4B2E2E] dark:text-white mb-4">
              Nuestra Comunidad en Números
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Únete a miles de amantes de los caballos que ya forman parte de nuestra familia ecuestre
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  50+
                </div>
                <p className="text-lg font-medium text-[#4B2E2E] dark:text-white mb-1">Ejemplares</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">en el Hall de la Fama</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  4
                </div>
                <p className="text-lg font-medium text-[#4B2E2E] dark:text-white mb-1">Andares</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">del Caballo Criollo</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  24/7
                </div>
                <p className="text-lg font-medium text-[#4B2E2E] dark:text-white mb-1">Disponible</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">para la comunidad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 rounded-2xl p-12 text-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para formar parte de la comunidad?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Únete a nosotros y descubre el fascinante mundo del caballo criollo colombiano. 
                Comparte tu pasión, aprende de expertos y conecta con otros amantes de los caballos.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-100 font-semibold px-8 py-3">
                    <Users className="mr-2 h-5 w-5" />
                    Únete Ahora
                  </Button>
                </Link>
                <Link href="/hall">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-amber-600 font-semibold px-8 py-3">
                    <Trophy className="mr-2 h-5 w-5" />
                    Explorar Hall de la Fama
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
