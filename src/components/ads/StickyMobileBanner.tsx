
"use client";

import React, { useState, useEffect } from 'react';
import BannerSlot from './BannerSlot';

interface StickyMobileBannerProps {
  className?: string;
  showOnDesktop?: boolean;
  offsetTop?: number;
}

export default function StickyMobileBanner({ 
  className = '',
  showOnDesktop = false,
  offsetTop = 0
}: StickyMobileBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Evitar hidration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detectar si es dispositivo móvil
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  // No mostrar en desktop a menos que esté explícitamente habilitado
  if (isMounted && !isMobile && !showOnDesktop) {
    return null;
  }

  // No renderizar nada si no está visible
  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-40 
        ${offsetTop > 0 ? `bottom-[${offsetTop}px]` : ''}
        ${className}
      `}
      style={{ bottom: offsetTop }}
    >
      <div className="mx-auto px-2 pb-2">
        <div className="relative bg-white/95 backdrop-blur-sm border-t border-gray-200 rounded-t-lg shadow-lg overflow-hidden">
          <BannerSlot
            slot="mobile-sticky"
            showCloseButton={true}
            onClose={handleClose}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
