"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

type Props = {
  channelId?: string
  videoId?: string
  autoplay?: boolean
  muted?: boolean
  title?: string
}

export default function YouTubeLive({ channelId, videoId, autoplay, muted, title }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validación de props
  if (!channelId && !videoId) {
    return (
      <ErrorMessage 
        message="No se ha proporcionado un ID de canal o video de YouTube"
        className="w-full"
      />
    );
  }

  // Construir URL del embed
  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=${autoplay?1:0}&mute=${muted?1:0}`
    : `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=${autoplay?1:0}&mute=${muted?1:0}`;

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError("Error cargando el video. Por favor intenta más tarde.");
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-card border border-black/5 bg-white">
      <div className="aspect-video relative">
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600">Cargando transmisión...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ErrorMessage 
              message={error}
              onRetry={() => {
                setError(null);
                setLoading(true);
                // Force iframe reload by changing key
                const iframe = document.querySelector('iframe[data-youtube]') as HTMLIFrameElement;
                if (iframe) {
                  iframe.src = iframe.src;
                }
              }}
            />
          </div>
        )}

        {/* YouTube iframe */}
        <iframe
          data-youtube
          className={`w-full h-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
          src={src}
          title={title ?? 'YouTube Live'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
      
      {/* Info bar */}
      <div className="p-3 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {title || "Transmisión en vivo"}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">EN VIVO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
