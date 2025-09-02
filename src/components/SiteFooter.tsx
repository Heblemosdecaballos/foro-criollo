
'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone,
  MapPin,
  Heart,
  ArrowUp,
  ExternalLink
} from "lucide-react";

const BRAND = {
  name: "Hablando de Caballos",
  logoSrc: "/brand/horse.png",
  tagline: "El punto de encuentro de El Caballo Criollo Colombiano",
  description: "Conectamos jinetes, criadores y amantes de los caballos criollos en toda América Latina."
};

const FOOTER_SECTIONS = {
  platform: {
    title: "Plataforma",
    links: [
      { label: "Foros", href: "/foros" },
      { label: "Noticias", href: "/noticias" },
      { label: "Historias", href: "/historias" },
      { label: "Hall of Fame", href: "/hall" },
      { label: "Chat en Vivo", href: "/chat" },
    ]
  },
  community: {
    title: "Comunidad",
    links: [
      { label: "Crear Cuenta", href: "/registro" },
      { label: "Iniciar Sesión", href: "/login" },
      { label: "Perfil", href: "/perfil" },
      { label: "Reglas de la Comunidad", href: "/reglas" },
      { label: "Moderadores", href: "/moderadores" },
    ]
  },
  resources: {
    title: "Recursos",
    links: [
      { label: "Guía de Andares", href: "/hall" },
      { label: "Eventos", href: "/eventos" },
      { label: "Criadores", href: "/criadores" },
      { label: "Veterinarios", href: "/veterinarios" },
      { label: "Centros de Entrenamiento", href: "/centros" },
    ]
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Política de Privacidad", href: "/privacidad" },
      { label: "Términos de Uso", href: "/terminos" },
      { label: "Contacto", href: "/contacto" },
      { label: "Centro de Ayuda", href: "/ayuda" },
      { label: "Reportar Problema", href: "/reportar" },
    ]
  }
};

const SOCIAL_LINKS = [
  { 
    icon: Facebook, 
    label: "Facebook", 
    href: "https://facebook.com/hablandodecaballos",
    color: "hover:text-blue-600"
  },
  { 
    icon: Instagram, 
    label: "Instagram", 
    href: "https://instagram.com/hablandodecaballos",
    color: "hover:text-pink-600"
  },
  { 
    icon: Twitter, 
    label: "Twitter", 
    href: "https://twitter.com/hablandodecaballos",
    color: "hover:text-blue-400"
  },
  { 
    icon: Youtube, 
    label: "YouTube", 
    href: "https://youtube.com/hablandodecaballos",
    color: "hover:text-red-600"
  },
];

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "contacto@hablandodecaballos.com",
    href: "mailto:contacto@hablandodecaballos.com"
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "+57 1 234 5678",
    href: "tel:+5712345678"
  },
  {
    icon: MapPin,
    label: "Ubicación",
    value: "Bogotá, Colombia",
    href: "https://maps.google.com"
  },
];

export default function SiteFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();

  // Función para scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Mostrar/ocultar botón scroll to top basado en scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="relative mt-16 bg-primary-brown text-white">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='https://c8.alamy.com/comp/2HBG2M6/seamless-pattern-white-background-with-brown-circles-vector-illustration-2HBG2M6.jpg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Contenido principal del footer */}
      <div className="relative">
        {/* Sección principal */}
        <div className="section-spacing">
          <div className="container-unified">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8 lg:gap-12">
              
              {/* Información de la marca */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Image
                    src={BRAND.logoSrc}
                    alt={`${BRAND.name} logo`}
                    width={40}
                    height={40}
                    className="brightness-0 invert"
                  />
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {BRAND.name}
                    </h3>
                    <p className="text-sm text-white/80">
                      Comunidad Ecuestre
                    </p>
                  </div>
                </div>
                
                <p className="text-white/90 mb-6 leading-relaxed">
                  {BRAND.description}
                </p>
                
                {/* Redes sociales */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white/90">Síguenos</h4>
                  <div className="flex items-center gap-3">
                    {SOCIAL_LINKS.map((social) => {
                      const IconComponent = social.icon;
                      return (
                        <Link
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200",
                            "hover:scale-110 hover:shadow-lg",
                            social.color
                          )}
                          aria-label={social.label}
                        >
                          <IconComponent className="w-5 h-5" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Links de navegación organizados */}
              {Object.entries(FOOTER_SECTIONS).map(([key, section]) => (
                <div key={key}>
                  <h4 className="font-semibold text-white mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-white/80 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1 group"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Información de contacto */}
            <div className="border-t border-white/20 mt-12 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CONTACT_INFO.map((contact) => {
                  const IconComponent = contact.icon;
                  return (
                    <Link
                      key={contact.label}
                      href={contact.href}
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 group"
                    >
                      <div className="p-2 bg-accent-gold rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-white/70 font-medium">
                          {contact.label}
                        </div>
                        <div className="text-sm text-white">
                          {contact.value}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-white/20 py-6">
          <div className="container-unified">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span>© {currentYear} {BRAND.name}</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  Hecho con <Heart className="w-4 h-4 text-red-400 fill-current" /> en Colombia
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>Versión 2.0.0</span>
                <span>•</span>
                <Link 
                  href="/status" 
                  className="flex items-center gap-1 hover:text-white transition-colors duration-200"
                >
                  <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
                  Estado del Servicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-accent-gold hover:bg-accent-gold-light text-white rounded-full shadow-warm-lg hover:shadow-warm-xl transition-all duration-300 hover:scale-110 z-40"
          aria-label="Volver arriba"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}

// Helper function
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Add useEffect import
import { useEffect } from "react";
