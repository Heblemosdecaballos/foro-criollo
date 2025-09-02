
// Main Hall of Fame page
import { Suspense } from 'react';
import { Metadata } from 'next';
import HallOfFameContent from './HallOfFameContent';

export const metadata: Metadata = {
  title: 'Hall of Fame - Hablando de Caballos',
  description: 'Descubre los ejemplares más destacados del caballo criollo colombiano. Galería de fotos, videos y comentarios de la comunidad.',
};

export const dynamic = 'force-dynamic';

export default function HallOfFamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hall of Fame
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre los ejemplares más destacados del caballo criollo colombiano. 
            Una galería donde celebramos la belleza, elegancia y tradición de nuestra raza.
          </p>
        </div>

        <Suspense fallback={<HallOfFameLoading />}>
          <HallOfFameContent />
        </Suspense>
      </div>
    </div>
  );
}

function HallOfFameLoading() {
  return (
    <div className="space-y-8">
      {/* Search bar skeleton */}
      <div className="max-w-md mx-auto">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex justify-center space-x-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        ))}
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
