
'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BannerSlot } from "@/components/ads";
import { Menu, X, ChevronDown, User, Settings, LogOut, Bell } from "lucide-react";

/**
 * Logo oficial unificado
 */
const BRAND = {
  name: "Hablando de Caballos",
  logoSrc: "/brand/horse.png",
  w: 32,
  h: 32,
};

/** Navegación principal unificada */
const NAVIGATION = [
  { label: "Inicio", href: "/" },
  { label: "Foros", href: "/foros", badge: "Nuevo" },
  { label: "Noticias", href: "/noticias" },
  { label: "Historias", href: "/historias" },
  { label: "En Vivo", href: "/en-vivo", badge: "Live" },
  { label: "Hall of Fame", href: "/hall" },
  { label: "Chat", href: "/chat" },
];

interface HeaderProps {
  user?: any;
  authError?: boolean;
}

export default function Header({ user, authError = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Efecto de scroll para header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    };
    
    if (isMenuOpen || isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen, isProfileOpen]);

  return (
    <>
      {/* Banner de error de configuración */}
      {authError && (
        <div className="bg-error-red text-white text-center py-2 px-4 text-sm animate-fade-in-up">
          <div className="container-unified flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            ⚠️ Configuración de base de datos pendiente - Algunas funciones pueden no estar disponibles
          </div>
        </div>
      )}

      {/* Header principal */}
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
          isScrolled 
            ? "bg-neutral-cream/95 backdrop-blur-md shadow-warm border-b border-neutral-sand" 
            : "bg-neutral-cream/80 backdrop-blur-sm"
        )}
      >
        <div className="container-unified">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Brand & Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative">
                <Image
                  src={BRAND.logoSrc}
                  alt={`${BRAND.name} logo`}
                  width={BRAND.w}
                  height={BRAND.h}
                  priority
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                <div className="absolute -inset-2 bg-primary-brown/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-xl lg:text-2xl font-bold text-warm-gray-900 tracking-tight">
                  {BRAND.name}
                </span>
                <div className="text-xs text-warm-gray-600 font-medium">
                  Comunidad Ecuestre
                </div>
              </div>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {NAVIGATION.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-base font-medium text-warm-gray-700 hover:text-primary-brown rounded-lg transition-all duration-200 hover:bg-neutral-sand group"
                >
                  {item.label}
                  {item.badge && (
                    <span className={cn(
                      "absolute -top-1 -right-1 px-2 py-0.5 text-xs font-semibold rounded-full",
                      item.badge === "Live" 
                        ? "bg-error-red text-white animate-pulse-warm" 
                        : "bg-accent-gold text-white"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-brown transition-all duration-200 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Acciones del usuario */}
            <div className="flex items-center gap-2">
              {/* Notificaciones (solo para usuarios autenticados) */}
              {user && (
                <button className="relative p-2 text-warm-gray-600 hover:text-primary-brown hover:bg-neutral-sand rounded-lg transition-all duration-200">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-red rounded-full"></span>
                </button>
              )}

              {/* Usuario autenticado */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    className="flex items-center gap-2 p-2 text-sm font-medium text-warm-gray-700 hover:text-primary-brown hover:bg-neutral-sand rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="hidden md:block">
                      {user.email?.split("@")[0] || "Usuario"}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isProfileOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Menú de perfil */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-warm-lg border border-neutral-sand py-2 animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-neutral-sand">
                        <div className="font-medium text-warm-gray-900">
                          {user.email?.split("@")[0] || "Usuario"}
                        </div>
                        <div className="text-sm text-warm-gray-600">
                          {user.email}
                        </div>
                      </div>
                      
                      <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-sm text-warm-gray-700 hover:bg-neutral-sand transition-colors duration-200">
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </Link>
                      
                      <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-warm-gray-700 hover:bg-neutral-sand transition-colors duration-200">
                        <Settings className="w-4 h-4" />
                        Configuración
                      </Link>
                      
                      <hr className="my-2 border-neutral-sand" />
                      
                      <Link href="/logout" className="flex items-center gap-2 px-4 py-2 text-sm text-error-red hover:bg-red-50 transition-colors duration-200">
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* Usuario no autenticado */
                <div className="hidden md:flex items-center gap-2">
                  <Link 
                    href="/login" 
                    className="btn-ghost"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/registro" 
                    className="btn-primary"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Menú móvil */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="lg:hidden p-2 text-warm-gray-600 hover:text-primary-brown hover:bg-neutral-sand rounded-lg transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil expandido */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-neutral-sand shadow-warm-lg animate-fade-in-up">
            <div className="container-unified py-4">
              <div className="space-y-2">
                {NAVIGATION.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-warm-gray-700 hover:text-primary-brown hover:bg-neutral-sand rounded-lg transition-all duration-200"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-1 text-xs font-semibold rounded-full",
                        item.badge === "Live" 
                          ? "bg-error-red text-white" 
                          : "bg-accent-gold text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                
                {/* Acciones móvil */}
                {!user && (
                  <div className="pt-4 border-t border-neutral-sand space-y-2">
                    <Link 
                      href="/login" 
                      className="btn-ghost w-full justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      href="/registro" 
                      className="btn-primary w-full justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Banner publicitario header */}
      <div className="w-full bg-neutral-cream/90 border-b border-neutral-sand py-2">
        <div className="container-unified flex justify-center">
          <BannerSlot slot="header-leaderboard" />
        </div>
      </div>
    </>
  );
}

// Helper function for className concatenation (assuming it exists)
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
