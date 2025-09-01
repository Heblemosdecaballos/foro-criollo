'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, 
  MessageSquare, 
  Newspaper, 
  BookOpen, 
  Radio, 
  Trophy, 
  MessageCircle,
  User,
  Menu,
  X,
  Bell,
  Search
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'live' | 'new' | 'count';
  count?: number;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    label: "Inicio", 
    href: "/", 
    icon: Home 
  },
  { 
    label: "Foros", 
    href: "/foros", 
    icon: MessageSquare,
    badge: "Nuevo",
    badgeType: "new"
  },
  { 
    label: "Noticias", 
    href: "/noticias", 
    icon: Newspaper 
  },
  { 
    label: "Historias", 
    href: "/historias", 
    icon: BookOpen 
  },
  { 
    label: "En Vivo", 
    href: "/en-vivo", 
    icon: Radio,
    badge: "Live",
    badgeType: "live"
  },
  { 
    label: "Hall of Fame", 
    href: "/hall", 
    icon: Trophy 
  },
  { 
    label: "Chat", 
    href: "/chat", 
    icon: MessageCircle,
    count: 3
  },
];

interface MobileNavigationProps {
  user?: any;
  className?: string;
}

export default function MobileNavigation({ user, className = '' }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide en scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getBadgeClasses = (badgeType?: string) => {
    switch (badgeType) {
      case 'live':
        return 'bg-live text-white animate-pulse';
      case 'new':
        return 'bg-accent-gold text-white';
      case 'count':
        return 'bg-error text-white';
      default:
        return 'bg-accent-gold text-white';
    }
  };

  return (
    <>
      {/* Navegación inferior móvil */}
      <nav 
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white/95 backdrop-blur-md border-t border-neutral-sand
          transform transition-transform duration-300 ease-in-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
          ${className}
        `}
      >
        <div className="px-2 py-1">
          <div className="flex items-center justify-around">
            {NAVIGATION_ITEMS.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative flex flex-col items-center justify-center p-2 rounded-lg
                    transition-all duration-200 ease-in-out min-w-[60px]
                    ${active 
                      ? 'text-primary-brown bg-primary-brown/10 scale-105' 
                      : 'text-warm-gray-600 hover:text-primary-brown hover:bg-neutral-sand'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''} transition-transform duration-200`} />
                    
                    {/* Badge */}
                    {item.badge && (
                      <span className={`
                        absolute -top-1 -right-1 px-1 py-0.5 text-xs font-bold rounded-full
                        ${getBadgeClasses(item.badgeType)}
                        transform scale-75
                      `}>
                        {item.badge}
                      </span>
                    )}
                    
                    {/* Count */}
                    {item.count && item.count > 0 && (
                      <span className={`
                        absolute -top-1 -right-1 w-4 h-4 text-xs font-bold rounded-full
                        flex items-center justify-center
                        ${getBadgeClasses('count')}
                      `}>
                        {item.count > 9 ? '9+' : item.count}
                      </span>
                    )}
                  </div>
                  
                  <span className={`
                    text-xs font-medium leading-none
                    ${active ? 'font-semibold' : ''}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Indicador activo */}
                  {active && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-brown rounded-full" />
                  )}
                </Link>
              );
            })}
            
            {/* Menú adicional */}
            <MobileMenuButton user={user} />
          </div>
        </div>
      </nav>

      {/* Espaciado para evitar que el contenido se oculte */}
      <div className="h-16 md:hidden" />
    </>
  );
}

// Componente del botón de menú adicional
function MobileMenuButton({ user }: { user?: any }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const additionalItems = NAVIGATION_ITEMS.slice(5);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center p-2 rounded-lg text-warm-gray-600 hover:text-primary-brown hover:bg-neutral-sand transition-all duration-200 min-w-[60px]"
      >
        <Menu className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">Más</span>
      </button>

      {/* Overlay del menú */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-warm-gray-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel del menú */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-warm-xl animate-slide-in-down">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg text-warm-gray-900">
                  Menú
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-warm-gray-600 hover:text-primary-brown hover:bg-neutral-sand transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items adicionales */}
              <div className="space-y-2 mb-6">
                {additionalItems.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg text-warm-gray-700 hover:text-primary-brown hover:bg-neutral-sand transition-all duration-200"
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {item.badge && (
                          <span className={`
                            absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold rounded-full
                            ${getBadgeClasses(item.badgeType)}
                          `}>
                            {item.badge}
                          </span>
                        )}
                        {item.count && item.count > 0 && (
                          <span className={`
                            absolute -top-1 -right-1 w-4 h-4 text-xs font-bold rounded-full
                            flex items-center justify-center
                            ${getBadgeClasses('count')}
                          `}>
                            {item.count > 9 ? '9+' : item.count}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Acciones de usuario */}
              <div className="border-t border-neutral-sand pt-4">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/perfil"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg text-warm-gray-700 hover:text-primary-brown hover:bg-neutral-sand transition-all duration-200"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Mi Perfil</span>
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg text-warm-gray-700 hover:text-primary-brown hover:bg-neutral-sand transition-all duration-200"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="font-medium">Notificaciones</span>
                      <span className="ml-auto w-2 h-2 bg-error rounded-full"></span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="btn-ghost w-full justify-center"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/registro"
                      onClick={() => setIsOpen(false)}
                      className="btn-primary w-full justify-center"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Función auxiliar para clases de badge
function getBadgeClasses(badgeType?: string) {
  switch (badgeType) {
    case 'live':
      return 'bg-live text-white animate-pulse';
    case 'new':
      return 'bg-accent-gold text-white';
    case 'count':
      return 'bg-error text-white';
    default:
      return 'bg-accent-gold text-white';
  }
}

// Componente de búsqueda móvil
export function MobileSearchBar({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 w-full p-3 bg-neutral-sand/50 rounded-lg
          text-warm-gray-600 hover:text-primary-brown
          transition-colors duration-200
          ${className}
        `}
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Buscar en la comunidad...</span>
      </button>

      {/* Modal de búsqueda */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-warm-gray-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-0 left-0 right-0 bg-white shadow-warm-lg">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar foros, noticias, historias..."
                    className="w-full pl-10 pr-4 py-3 bg-neutral-sand/50 rounded-lg border-none focus:ring-2 focus:ring-primary-brown focus:bg-white transition-all duration-200"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-warm-gray-600 hover:text-primary-brown"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Sugerencias rápidas */}
              {query.length === 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-warm-gray-700 mb-2">Búsquedas populares:</p>
                  {['Caballo criollo', 'Entrenamiento', 'Competencias', 'Crianza'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="block w-full text-left p-2 text-sm text-warm-gray-600 hover:text-primary-brown hover:bg-neutral-sand rounded-lg transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
