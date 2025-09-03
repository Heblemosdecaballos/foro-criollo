
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare,
  Trophy,
  ShoppingCart,
  Image as ImageIcon,
  HelpCircle,
  Search,
  Award,
  Mail,
  MapPin,
  Phone
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t mt-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-amber-600 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-600 flex items-center">
                  Hablando de Caballos
                  <Image 
                    src="/paso-fino-colombiano.png" 
                    alt="Paso Fino Colombiano" 
                    width={20} 
                    height={20} 
                    className="ml-2"
                  />
                </h3>
                <p className="text-xs text-muted-foreground">Comunidad Ecuestre</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              El punto de encuentro del caballo criollo colombiano. 
              Conectamos criadores, jinetes y amantes de los caballos.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Colombia</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navegación</h4>
            <div className="space-y-2">
              <Link href="/forums" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="mr-2 h-4 w-4" />
                Foros de discusión
              </Link>
              <Link href="/hall" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Trophy className="mr-2 h-4 w-4" />
                Hall of Fame
              </Link>
              <Link href="/marketplace" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Marketplace
              </Link>
              <Link href="/galeria" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ImageIcon className="mr-2 h-4 w-4" />
                Galería multimedia
              </Link>
              <Link href="/rankings" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Award className="mr-2 h-4 w-4" />
                Rankings
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Recursos</h4>
            <div className="space-y-2">
              <Link href="/buscar" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Search className="mr-2 h-4 w-4" />
                Búsqueda avanzada
              </Link>
              <Link href="/ayuda" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="mr-2 h-4 w-4" />
                Ayuda y FAQ
              </Link>
              <Link href="/ayuda" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                Guías para principiantes
              </Link>
              <Link href="/ayuda" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tutoriales en video
              </Link>
              <Link href="/ayuda" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                Código de conducta
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contacto</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <span>admin@hablandodecaballos.com</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                <span>+57 (300) 123-4567</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-foreground">Síguenos</h5>
              <div className="space-y-1">
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Facebook
                </a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Instagram
                </a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  YouTube
                </a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Hablando de Caballos. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacidad" className="hover:text-foreground transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="hover:text-foreground transition-colors">
                Términos de Uso
              </Link>
              <Link href="/ayuda" className="hover:text-foreground transition-colors">
                Soporte
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Plataforma desarrollada con 🐎 para la comunidad ecuestre colombiana
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
