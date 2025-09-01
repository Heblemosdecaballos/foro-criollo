
'use client';

// Layout con sidebar que incluye banner rectangle
import React from 'react';
import { BannerSlot } from '@/components/ads';
import { Card, CardHeader } from '@/components/ui/Card';
import { TrendingUp, Users, MessageSquare, Calendar } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  showBannerAd?: boolean;
  showDefaultWidgets?: boolean;
  className?: string;
}

const DEFAULT_WIDGETS = [
  {
    title: "🏆 Highlights de la Semana",
    icon: TrendingUp,
    items: [
      {
        title: "Nuevo campeón nacional de trocha y galope",
        subtitle: "Hace 2 días",
        href: "/noticias/campeon-nacional-2024"
      },
      {
        title: "Récord en competencia de paso fino",
        subtitle: "Hace 4 días", 
        href: "/noticias/record-paso-fino"
      },
      {
        title: "Inauguración centro ecuestre en Medellín",
        subtitle: "Hace 1 semana",
        href: "/noticias/centro-ecuestre-medellin"
      }
    ]
  },
  {
    title: "👥 Comunidad Activa",
    icon: Users,
    stats: [
      { label: "Miembros activos", value: "2,847" },
      { label: "Nuevos esta semana", value: "127" },
      { label: "Foros creados hoy", value: "23" }
    ]
  },
  {
    title: "💬 Conversaciones Populares",
    icon: MessageSquare,
    items: [
      {
        title: "Técnicas de entrenamiento para paso fino",
        subtitle: "156 respuestas",
        href: "/foros/tecnicas-entrenamiento"
      },
      {
        title: "Criadores recomendados en Colombia", 
        subtitle: "89 respuestas",
        href: "/foros/criadores-colombia"
      },
      {
        title: "Cuidados veterinarios especializados",
        subtitle: "67 respuestas",
        href: "/foros/cuidados-veterinarios"
      }
    ]
  },
  {
    title: "📅 Próximos Eventos",
    icon: Calendar,
    items: [
      {
        title: "Copa Nacional de Cabalgata",
        subtitle: "15-17 Marzo, Bogotá",
        href: "/eventos/copa-nacional-cabalgata"
      },
      {
        title: "Feria Equina de Medellín",
        subtitle: "22-24 Marzo, Medellín", 
        href: "/eventos/feria-equina-medellin"
      }
    ]
  }
];

export default function SidebarLayout({ 
  children, 
  sidebarContent,
  showBannerAd = true,
  showDefaultWidgets = true,
  className = ''
}: SidebarLayoutProps) {
  return (
    <div className={`container-unified section-spacing ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-8">
          {children}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Banner publicitario */}
          {showBannerAd && (
            <div className="flex justify-center lg:justify-start">
              <BannerSlot slot="sidebar-rectangle" />
            </div>
          )}

          {/* Contenido personalizado del sidebar */}
          {sidebarContent && (
            <div className="animate-fade-in-up">
              {sidebarContent}
            </div>
          )}

          {/* Widgets por defecto */}
          {showDefaultWidgets && (
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {DEFAULT_WIDGETS.map((widget, index) => (
                <Card key={widget.title} variant="default" className="overflow-hidden">
                  <CardHeader 
                    title={widget.title}
                    actions={
                      <div className="p-2 bg-primary-brown/10 rounded-lg">
                        <widget.icon className="w-4 h-4 text-primary-brown" />
                      </div>
                    }
                  />
                  
                  <div className="px-6 pb-6">
                    {/* Items de lista */}
                    {widget.items && (
                      <div className="space-y-3">
                        {widget.items.map((item, itemIndex) => (
                          <a
                            key={itemIndex}
                            href={item.href}
                            className="block p-3 rounded-lg hover:bg-neutral-sand transition-all duration-200 group"
                          >
                            <div className="text-sm font-medium text-warm-gray-900 group-hover:text-primary-brown transition-colors duration-200 line-clamp-2">
                              {item.title}
                            </div>
                            <div className="text-xs text-warm-gray-600 mt-1">
                              {item.subtitle}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Estadísticas */}
                    {widget.stats && (
                      <div className="space-y-3">
                        {widget.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="flex justify-between items-center">
                            <span className="text-sm text-warm-gray-600">
                              {stat.label}
                            </span>
                            <span className="text-lg font-bold text-primary-brown">
                              {stat.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* CTA para unirse a la comunidad */}
          <Card variant="hero" className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-warm-gray-900 mb-3">
                ¡Únete a la Comunidad!
              </h3>
              <p className="text-warm-gray-600 mb-4 text-sm leading-relaxed">
                Conecta con jinetes, criadores y amantes de los caballos criollos.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a 
                  href="/registro" 
                  className="btn-primary flex-1 justify-center text-sm"
                >
                  Registrarse Gratis
                </a>
                <a 
                  href="/foros" 
                  className="btn-secondary flex-1 justify-center text-sm"
                >
                  Explorar Foros
                </a>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
