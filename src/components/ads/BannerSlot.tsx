
"use client";

import React, { Suspense } from 'react';
import BannerAd from './BannerAd';

// Tipos de slots de banners
type BannerSlotType = 
  | 'header-leaderboard'    
  | 'sidebar-rectangle'     
  | 'content-mobile'        
  | 'footer-leaderboard'    
  | 'mobile-sticky'         
  | 'interstitial';

interface BannerSlotProps {
  slot: BannerSlotType;
  className?: string;
  fallbackContent?: React.ReactNode;
  showCloseButton?: boolean;
  autoClose?: number;
  onClose?: () => void;
}

// Fallbacks específicos por tipo de slot
const DEFAULT_FALLBACKS = {
  'header-leaderboard': (
    <div className="w-full max-w-[728px] h-[60px] md:h-[90px] bg-gradient-to-r from-site-beige to-cream-100 rounded-lg border border-cream-200 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-sm font-medium text-neutral-700">🐎 Hablando de Caballos</div>
        <div className="text-xs text-neutral-500">Tu espacio publicitario aquí</div>
      </div>
    </div>
  ),
  'sidebar-rectangle': (
    <div className="w-full max-w-[300px] h-[250px] bg-gradient-to-b from-cream-50 to-cream-100 rounded-lg border border-cream-200 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-2xl mb-2">🏆</div>
        <div className="text-sm font-medium text-neutral-700 mb-1">Promociona tu negocio</div>
        <div className="text-xs text-neutral-500">Llega a miles de amantes de los caballos</div>
      </div>
    </div>
  ),
  'content-mobile': (
    <div className="w-full max-w-[320px] h-[50px] bg-gradient-to-r from-green-100 to-green-200 rounded-lg border border-green-300 flex items-center justify-center px-4">
      <div className="text-sm font-medium text-green-800">
        📢 Tu anuncio aquí - Contáctanos
      </div>
    </div>
  ),
  'footer-leaderboard': (
    <div className="w-full max-w-[728px] h-[60px] md:h-[90px] bg-gradient-to-r from-brown-700 to-brown-800 text-white rounded-lg flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-sm font-medium">Espacio Publicitario Premium</div>
        <div className="text-xs opacity-80">Máxima visibilidad para tu marca</div>
      </div>
    </div>
  ),
  'mobile-sticky': (
    <div className="w-full h-[50px] bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center px-4 rounded">
      <div className="text-sm font-medium truncate">
        📱 Publicidad móvil efectiva
      </div>
    </div>
  ),
  'interstitial': (
    <div className="w-full max-w-[600px] max-h-[400px] bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl border-2 border-purple-300 p-8 text-center">
      <div className="text-4xl mb-4">🎯</div>
      <div className="text-xl font-bold text-purple-800 mb-2">
        Publicidad de Alto Impacto
      </div>
      <div className="text-purple-700 mb-4">
        Captura la atención completa de tus visitantes con anuncios intersticiales
      </div>
      <div className="text-sm text-purple-600">
        Contacta con nosotros para reservar este espacio premium
      </div>
    </div>
  )
};

export default function BannerSlot({
  slot,
  className = '',
  fallbackContent,
  showCloseButton = false,
  autoClose,
  onClose
}: BannerSlotProps) {
  const defaultFallback = DEFAULT_FALLBACKS[slot];
  
  return (
    <div className={`banner-slot banner-slot--${slot} ${className}`}>
      <Suspense fallback={
        <div className="animate-pulse bg-gray-200 rounded-lg h-20 flex items-center justify-center">
          <div className="text-sm text-gray-500">Cargando anuncio...</div>
        </div>
      }>
        <BannerAd
          position={slot}
          showCloseButton={showCloseButton}
          autoClose={autoClose}
          onClose={onClose}
          fallbackContent={fallbackContent || defaultFallback}
        />
      </Suspense>
    </div>
  );
}
