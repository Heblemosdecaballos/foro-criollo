
"use client";

import React, { useState, useEffect } from 'react';
import BannerSlot from './BannerSlot';

interface InterstitialBannerProps {
  className?: string;
  showAfterSeconds?: number;
  maxShowsPerSession?: number;
  autoClose?: number;
}

export default function InterstitialBanner({
  className = '',
  showAfterSeconds = 30,
  maxShowsPerSession = 1,
  autoClose = 10
}: InterstitialBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Verificar si ya se mostró en esta sesión
    const sessionKey = 'interstitial_shown_count';
    const currentCount = parseInt(sessionStorage.getItem(sessionKey) || '0');
    
    if (currentCount >= maxShowsPerSession) {
      return; // No mostrar más veces
    }

    // Timer para mostrar después del tiempo especificado
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Incrementar contador de sesión
      sessionStorage.setItem(sessionKey, (currentCount + 1).toString());
    }, showAfterSeconds * 1000);

    return () => clearTimeout(timer);
  }, [isMounted, showAfterSeconds, maxShowsPerSession]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // No renderizar si no está montado o no está visible
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div className={`interstitial-banner ${className}`}>
      <BannerSlot
        slot="interstitial"
        showCloseButton={true}
        autoClose={autoClose}
        onClose={handleClose}
      />
    </div>
  );
}
