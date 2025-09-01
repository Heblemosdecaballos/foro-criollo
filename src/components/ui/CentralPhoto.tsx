'use client';

import Image from "next/image";
import { useState } from "react";
import { Star, Play, Calendar, MapPin, Award } from "lucide-react";

interface CentralPhotoProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  badge?: {
    text: string;
    type?: 'live' | 'featured' | 'award' | 'event';
    icon?: React.ReactNode;
  };
  overlay?: {
    title: string;
    description: string;
    metadata?: {
      date?: string;
      location?: string;
      rating?: number;
    };
  };
  variant?: 'hero' | 'card' | 'featured' | 'gallery';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}

const ASPECT_RATIOS = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
} as const;

const BADGE_STYLES = {
  live: 'bg-live text-white animate-pulse-warm',
  featured: 'bg-accent-gold text-white',
  award: 'bg-accent-bronze text-white',
  event: 'bg-info text-white',
} as const;

const BADGE_ICONS = {
  live: <Play className="w-3 h-3 fill-current" />,
  featured: <Star className="w-3 h-3 fill-current" />,
  award: <Award className="w-3 h-3 fill-current" />,
  event: <Calendar className="w-3 h-3" />,
} as const;

export default function CentralPhoto({
  src,
  alt,
  title,
  subtitle,
  badge,
  overlay,
  variant = 'card',
  aspectRatio = 'landscape',
  priority = false,
  className = '',
  onClick,
}: CentralPhotoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const containerClasses = {
    hero: 'relative overflow-hidden rounded-2xl shadow-warm-xl hover:shadow-warm-xl hover:scale-[1.02] transition-all duration-500',
    card: 'relative overflow-hidden rounded-xl shadow-md hover:shadow-warm hover:scale-[1.02] transition-all duration-300',
    featured: 'relative overflow-hidden rounded-2xl shadow-warm-lg hover:shadow-warm-xl hover:scale-105 transition-all duration-300',
    gallery: 'relative overflow-hidden rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200',
  };

  const imageClasses = {
    hero: 'w-full h-full object-cover transition-transform duration-700 hover:scale-110',
    card: 'w-full h-full object-cover transition-transform duration-500 hover:scale-105',
    featured: 'w-full h-full object-cover transition-transform duration-500 hover:scale-110',
    gallery: 'w-full h-full object-cover transition-transform duration-300 hover:scale-105',
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-accent-gold fill-current' : 'text-warm-gray-300'
        }`}
      />
    ));
  };

  return (
    <div
      className={`
        ${containerClasses[variant]}
        ${ASPECT_RATIOS[aspectRatio]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
        group
      `}
      onClick={onClick}
    >
      {/* Imagen principal */}
      <div className="relative w-full h-full">
        {!hasError ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className={`
              ${imageClasses[variant]}
              ${!isLoaded ? 'opacity-0' : 'opacity-100'}
              transition-opacity duration-300
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // Fallback cuando la imagen falla
          <div className="w-full h-full bg-gradient-card flex items-center justify-center">
            <div className="text-center text-warm-gray-500">
              <div className="w-16 h-16 mx-auto mb-2 bg-warm-gray-200 rounded-full flex items-center justify-center">
                <Image
                  src="/brand/horse.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="opacity-50"
                />
              </div>
              <p className="text-sm">Imagen no disponible</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-warm-gray-200 animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-warm-gray-200 via-warm-gray-100 to-warm-gray-200 animate-pulse" />
          </div>
        )}

        {/* Badge superior */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <div
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                backdrop-blur-sm border border-white/20
                ${BADGE_STYLES[badge.type || 'featured']}
              `}
            >
              {badge.icon || BADGE_ICONS[badge.type || 'featured']}
              {badge.text}
            </div>
          </div>
        )}

        {/* Título y subtítulo (para variante hero) */}
        {(title || subtitle) && variant === 'hero' && (
          <div className="absolute top-3 right-3 z-10 text-right">
            {title && (
              <h3 className="text-white font-display font-bold text-lg mb-1 drop-shadow-lg">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-white/90 text-sm drop-shadow-md">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Overlay con información */}
        {overlay && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="bg-gradient-to-t from-warm-gray-900/90 via-warm-gray-900/60 to-transparent p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {/* Título del overlay */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-display font-semibold text-warm-gray-900 text-base leading-tight">
                    {overlay.title}
                  </h4>
                  {overlay.metadata?.rating && (
                    <div className="flex items-center gap-1 ml-2">
                      {renderStars(overlay.metadata.rating)}
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <p className="text-warm-gray-600 text-sm mb-3 leading-relaxed">
                  {overlay.description}
                </p>

                {/* Metadata */}
                {overlay.metadata && (
                  <div className="flex items-center gap-4 text-xs text-warm-gray-500">
                    {overlay.metadata.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{overlay.metadata.date}</span>
                      </div>
                    )}
                    {overlay.metadata.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{overlay.metadata.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Efecto de hover para variantes interactivas */}
        {onClick && (
          <div className="absolute inset-0 bg-primary-brown/0 group-hover:bg-primary-brown/10 transition-colors duration-300 z-5" />
        )}
      </div>

      {/* Título y subtítulo (para otras variantes) */}
      {(title || subtitle) && variant !== 'hero' && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3">
            {title && (
              <h3 className="font-display font-semibold text-warm-gray-900 text-sm mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-warm-gray-600 text-xs">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente especializado para la foto central del hero
export function HeroCentralPhoto({
  className = '',
  ...props
}: Omit<CentralPhotoProps, 'variant'>) {
  return (
    <CentralPhoto
      {...props}
      variant="hero"
      aspectRatio="landscape"
      priority={true}
      className={`animate-slide-in-right ${className}`}
    />
  );
}

// Componente especializado para galerías
export function GalleryCentralPhoto({
  className = '',
  ...props
}: Omit<CentralPhotoProps, 'variant'>) {
  return (
    <CentralPhoto
      {...props}
      variant="gallery"
      className={`hover-lift ${className}`}
    />
  );
}

// Componente especializado para cards destacadas
export function FeaturedCentralPhoto({
  className = '',
  ...props
}: Omit<CentralPhotoProps, 'variant'>) {
  return (
    <CentralPhoto
      {...props}
      variant="featured"
      className={`animate-fade-in-up ${className}`}
    />
  );
}
