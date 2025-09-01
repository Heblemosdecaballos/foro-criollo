
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Play, X } from 'lucide-react';

// Tipos de datos del banner
interface BannerData {
  id: string;
  title: string;
  description?: string;
  banner_type: 'image' | 'video' | 'html';
  image_url?: string;
  video_url?: string;
  html_content?: string;
  click_url: string;
  target_blank?: boolean;
  advertiser_name?: string;
  position: BannerPosition;
}

// Posiciones posibles para banners
type BannerPosition = 
  | 'header-leaderboard'    // 728x90
  | 'sidebar-rectangle'     // 300x250  
  | 'content-mobile'        // 320x50
  | 'footer-leaderboard'    // 728x90
  | 'mobile-sticky'         // 320x50 sticky
  | 'interstitial';         // Pantalla completa

// Props del componente
interface BannerAdProps {
  position: BannerPosition;
  className?: string;
  showCloseButton?: boolean;
  autoClose?: number; // segundos
  onClose?: () => void;
  fallbackContent?: React.ReactNode;
  // Override de datos específicos (opcional)
  bannerData?: BannerData;
}

// Configuraciones de tamaño por posición
const POSITION_CONFIG = {
  'header-leaderboard': { 
    width: 728, 
    height: 90, 
    containerClass: 'w-full max-w-[728px] h-[90px]',
    responsive: 'md:h-[90px] h-[60px]' 
  },
  'sidebar-rectangle': { 
    width: 300, 
    height: 250, 
    containerClass: 'w-[300px] h-[250px]',
    responsive: 'sm:w-[300px] w-full' 
  },
  'content-mobile': { 
    width: 320, 
    height: 50, 
    containerClass: 'w-full max-w-[320px] h-[50px]',
    responsive: 'h-[50px]' 
  },
  'footer-leaderboard': { 
    width: 728, 
    height: 90, 
    containerClass: 'w-full max-w-[728px] h-[90px]',
    responsive: 'md:h-[90px] h-[60px]' 
  },
  'mobile-sticky': { 
    width: 320, 
    height: 50, 
    containerClass: 'w-full h-[50px]',
    responsive: 'h-[50px]' 
  },
  'interstitial': { 
    width: 600, 
    height: 400, 
    containerClass: 'w-full max-w-[600px] max-h-[400px]',
    responsive: 'w-[90vw] h-[70vh] max-w-[600px] max-h-[400px]' 
  }
};

export default function BannerAd({ 
  position, 
  className = '', 
  showCloseButton = false,
  autoClose,
  onClose,
  fallbackContent,
  bannerData: overrideBanner
}: BannerAdProps) {
  const [banner, setBanner] = useState<BannerData | null>(overrideBanner || null);
  const [loading, setLoading] = useState(!overrideBanner);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [trackingData, setTrackingData] = useState<{
    session_id: string;
    start_time: number;
  } | null>(null);
  
  const bannerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generar session ID único
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Cargar datos del banner si no se proporcionaron
  useEffect(() => {
    if (overrideBanner) {
      setBanner(overrideBanner);
      setLoading(false);
      return;
    }

    const loadBanner = async () => {
      try {
        const response = await fetch(`/api/banners?position=${position}&limit=1`);
        const result = await response.json();
        
        if (result.success && result.data?.length > 0) {
          setBanner(result.data[0]);
        } else {
          setError('No hay banners disponibles para esta posición');
        }
      } catch (err) {
        setError('Error cargando banner');
        console.error('Error loading banner:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBanner();
  }, [position, overrideBanner]);

  // Configurar tracking de visibilidad
  useEffect(() => {
    if (!banner || !bannerRef.current) return;

    const sessionId = generateSessionId();
    const startTime = Date.now();
    setTrackingData({ session_id: sessionId, start_time: startTime });

    // Intersection Observer para tracking de impresiones
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Banner visible al 50% o más - registrar impresión
            trackImpression(sessionId, startTime);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (bannerRef.current) {
      observerRef.current.observe(bannerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [banner]);

  // Auto-close functionality
  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoClose, visible]);

  // Función para trackear impresión
  const trackImpression = async (sessionId: string, startTime: number) => {
    if (!banner) return;

    const viewDuration = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await fetch('/api/banners/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banner_id: banner.id,
          page_url: window.location.href,
          session_id: sessionId,
          view_duration: viewDuration,
          page_category: getPageCategory()
        })
      });
    } catch (err) {
      console.log('Error tracking impression:', err);
    }
  };

  // Función para trackear click
  const trackClick = async () => {
    if (!banner || !trackingData) return;

    try {
      await fetch('/api/banners/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banner_id: banner.id,
          page_url: window.location.href,
          session_id: trackingData.session_id,
          page_category: getPageCategory()
        })
      });
    } catch (err) {
      console.log('Error tracking click:', err);
    }
  };

  // Detectar categoría de página actual
  const getPageCategory = (): string => {
    const pathname = window.location.pathname;
    if (pathname.includes('/foros')) return 'foros';
    if (pathname.includes('/noticias')) return 'noticias';
    if (pathname.includes('/historias')) return 'historias';
    if (pathname.includes('/hall')) return 'hall';
    if (pathname.includes('/en-vivo')) return 'en-vivo';
    if (pathname.includes('/chat')) return 'chat';
    return 'general';
  };

  // Manejar click en banner
  const handleBannerClick = () => {
    if (!banner) return;
    
    trackClick();
    
    if (banner.click_url) {
      if (banner.target_blank !== false) {
        window.open(banner.click_url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = banner.click_url;
      }
    }
  };

  // Manejar cierre del banner
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // Si no es visible, no renderizar
  if (!visible) return null;

  // Estado de carga
  if (loading) {
    const config = POSITION_CONFIG[position];
    return (
      <div className={`${config.containerClass} ${config.responsive} ${className} bg-gray-100 animate-pulse rounded-lg flex items-center justify-center`}>
        <div className="text-sm text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Estado de error o sin banner
  if (error || !banner) {
    if (fallbackContent) {
      return <div className={className}>{fallbackContent}</div>;
    }
    return null; // No mostrar nada si no hay banner ni fallback
  }

  const config = POSITION_CONFIG[position];
  const isInterstitial = position === 'interstitial';

  // Container para interstitial (modal overlay)
  if (isInterstitial) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className={`relative ${config.containerClass} ${config.responsive} bg-white rounded-lg shadow-xl overflow-hidden`}>
          {/* Botón de cerrar siempre visible en interstitial */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
          
          <BannerContent
            banner={banner}
            config={config}
            onClick={handleBannerClick}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Container normal para otras posiciones
  return (
    <div 
      ref={bannerRef}
      className={`relative ${config.containerClass} ${config.responsive} ${className} overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Botón de cerrar (opcional) */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>
      )}

      <BannerContent
        banner={banner}
        config={config}
        onClick={handleBannerClick}
        className="w-full h-full"
      />

      {/* Badge de anunciante (opcional) */}
      {banner.advertiser_name && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
          <span className="opacity-70">Anuncio:</span> {banner.advertiser_name}
        </div>
      )}
    </div>
  );
}

// Componente para renderizar el contenido del banner
interface BannerContentProps {
  banner: BannerData;
  config: typeof POSITION_CONFIG[keyof typeof POSITION_CONFIG];
  onClick: () => void;
  className?: string;
}

function BannerContent({ banner, config, onClick, className = '' }: BannerContentProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const renderContent = () => {
    switch (banner.banner_type) {
      case 'image':
        if (!banner.image_url) {
          return <div className="flex items-center justify-center bg-gray-100 text-gray-500">Sin imagen</div>;
        }
        
        return (
          <div className="relative w-full h-full bg-gray-100">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                <div className="text-xs text-gray-500">Cargando imagen...</div>
              </div>
            )}
            
            {imageError ? (
              <div className="flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                Error cargando imagen
              </div>
            ) : (
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                sizes={`${config.width}px`}
                className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
            )}
          </div>
        );

      case 'video':
        if (!banner.video_url) {
          return <div className="flex items-center justify-center bg-gray-100 text-gray-500">Sin video</div>;
        }
        
        return (
          <div className="relative w-full h-full bg-black">
            <video
              src={banner.video_url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Play className="text-white/80" size={24} />
            </div>
          </div>
        );

      case 'html':
        if (!banner.html_content) {
          return <div className="flex items-center justify-center bg-gray-100 text-gray-500">Sin contenido HTML</div>;
        }
        
        return (
          <div 
            className="w-full h-full flex items-center justify-center p-2"
            dangerouslySetInnerHTML={{ __html: banner.html_content }}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center bg-gray-100 text-gray-500">
            Tipo de banner no soportado
          </div>
        );
    }
  };

  return (
    <div 
      className={`${className} cursor-pointer group transition-transform hover:scale-[1.02]`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Banner publicitario: ${banner.title}`}
    >
      {renderContent()}
      
      {/* Overlay con información al hacer hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ExternalLink className="text-white drop-shadow" size={20} />
        </div>
      </div>
    </div>
  );
}
