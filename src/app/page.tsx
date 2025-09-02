import Link from "next/link";
import Image from "next/image";
import { BannerSlot } from "@/components/ads";
import UnifiedCard, { CardBody } from "@/components/ui/UnifiedCard";
import { PrimaryButton, SecondaryButton } from "@/components/ui/UnifiedButton";
import { HeroCentralPhoto } from "@/components/ui/CentralPhoto";
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  ArrowRight, 
  Star,
  Play,
  ChevronRight
} from "lucide-react";

// Estadísticas de la comunidad (datos demo - en producción vendrían de la DB)
const COMMUNITY_STATS = [
  { label: "Miembros", value: "15,847", icon: Users, color: "text-blue-600" },
  { label: "Foros Activos", value: "2,156", icon: MessageSquare, color: "text-green-600" },
  { label: "Campeones", value: "89", icon: Trophy, color: "text-yellow-600" },
  { label: "Eventos", value: "156", icon: Calendar, color: "text-purple-600" },
];

// Características destacadas
const FEATURES = [
  {
    icon: MessageSquare,
    title: "Foros Especializados",
    description: "Discute técnicas, crianza y entrenamiento con expertos",
    href: "/foros"
  },
  {
    icon: Trophy,
    title: "Hall of Fame",
    description: "Galería de campeones y ejemplares destacados",
    href: "/hall"
  },
  {
    icon: Play,
    title: "Transmisiones en Vivo",
    description: "Eventos y competencias en tiempo real",
    href: "/en-vivo"
  },
];

// Testimonios de la comunidad
const TESTIMONIALS = [
  {
    name: "María Rodríguez",
    role: "Criadora Profesional",
    content: "La mejor comunidad para compartir conocimientos sobre caballos criollos. He aprendido técnicas invaluables aquí.",
    avatar: "/avatars/maria.jpg"
  },
  {
    name: "Carlos Mendoza", 
    role: "Jinete Competitivo",
    content: "Desde que me uní, mi rendimiento en competencias ha mejorado notablemente. Excelente comunidad.",
    avatar: "/avatars/carlos.jpg"
  },
];

export default function Home() {
  return (
    <>
      {/* ======= SECCIÓN HÉROE UNIFICADA ======= */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='https://www.shutterstock.com/image-vector/dot-pattern-seamless-background-polka-260nw-2476286677.jpg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="container-unified section-spacing relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* CONTENIDO IZQUIERDO */}
            <div className="lg:col-span-7 animate-fade-in-up">
              {/* Logo + Título Unificado */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src="/brand/horse.png"
                    alt="Caballo de marca"
                    width={64}
                    height={64}
                    className="brightness-0 invert animate-pulse-warm"
                    priority
                  />
                  <div className="absolute -inset-4 bg-white/20 rounded-full blur-lg opacity-50"></div>
                </div>
                <div>
                  <h1 className="font-display text-hero text-white font-bold leading-none text-balance">
                    Hablando de Caballos
                  </h1>
                  <p className="text-white/80 text-lg font-medium mt-1">
                    Comunidad Ecuestre de Colombia
                  </p>
                </div>
              </div>

              {/* Descripción Principal */}
              <p className="text-white/90 text-body-lg leading-relaxed mb-8 max-w-2xl">
                La comunidad más grande del caballo criollo colombiano. Conectamos chalanes, y amantes del caballo a nivel mundial.
              </p>

              {/* Estadísticas Rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {COMMUNITY_STATS.map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="text-center animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-white/70 text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/registro" className="btn-accent hover:scale-105">
                  Únete Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/foros" className="btn-secondary bg-white/20 border-white text-white hover:bg-white hover:text-primary-brown">
                  Explorar Foros
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* FOTO CENTRAL UNIFICADA */}
            <div className="lg:col-span-5">
              <HeroCentralPhoto
                src="/hero/portada.jpg"
                alt="Exhibición de caballos criollos colombianos"
                badge={{
                  text: "Destacado",
                  type: "featured"
                }}
                overlay={{
                  title: "Copa Nacional 2024",
                  description: "Los mejores ejemplares de caballos criollos colombianos reunidos en la competencia más prestigiosa del país.",
                  metadata: {
                    date: "Septiembre 2024",
                    location: "Bogotá, Colombia",
                    rating: 5
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======= CARACTERÍSTICAS PRINCIPALES ======= */}
      <section className="section-spacing bg-neutral-cream">
        <div className="container-unified">
          <div className="text-center mb-16">
            <h2 className="text-h1 font-display font-bold text-warm-gray-900 mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-body-lg text-warm-gray-600 max-w-2xl mx-auto">
              Herramientas especializadas para la comunidad ecuestre más activa de Latinoamérica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {FEATURES.map((feature, index) => (
              <UnifiedCard 
                key={feature.title}
                variant="elevated"
                hover={true}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardBody padding="xl">
                  <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-h3 font-display font-semibold text-warm-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-warm-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <Link 
                    href={feature.href}
                    className="btn-ghost group"
                  >
                    Explorar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </CardBody>
              </UnifiedCard>
            ))}
          </div>

          {/* Banner publicitario de contenido */}
          <div className="flex justify-center mb-16">
            <BannerSlot slot="content-mobile" />
          </div>
        </div>
      </section>

      {/* ======= TESTIMONIOS ======= */}
      <section className="section-spacing bg-white">
        <div className="container-unified">
          <div className="text-center mb-16">
            <h2 className="text-h1 font-display font-bold text-warm-gray-900 mb-4">
              Lo que dice nuestra comunidad
            </h2>
            <p className="text-body-lg text-warm-gray-600">
              Historias reales de miembros que han transformado su pasión por los caballos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <UnifiedCard 
                key={testimonial.name}
                variant="elevated"
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardBody padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-warm-gray-700 mb-4 leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <div className="font-semibold text-warm-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-warm-gray-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </UnifiedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ======= CTA FINAL ======= */}
      <section className="section-spacing gradient-hero">
        <div className="container-unified text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-h1 font-display font-bold text-white mb-6">
              ¿Listo para unirte a la comunidad?
            </h2>
            <p className="text-white/90 text-body-lg mb-8 leading-relaxed">
              Miles de jinetes, criadores y amantes de los caballos ya forman parte de nuestra familia. 
              Tu conocimiento y experiencia nos enriquecen a todos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro" className="btn-accent text-lg px-8 py-4">
                Crear Cuenta Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/foros" className="btn-ghost bg-white/20 text-white hover:bg-white hover:text-primary-brown text-lg px-8 py-4">
                Ver Foros
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
