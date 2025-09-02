
// Individual horse page
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HorseDetailContent from './HorseDetailContent';

interface Props {
  params: { horseId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In a real app, you'd fetch the horse data here for SEO
  return {
    title: 'Caballo - Hall of Fame',
    description: 'Detalles del caballo en el Hall of Fame',
  };
}

export const dynamic = 'force-dynamic';

export default function HorseDetailPage({ params }: Props) {
  if (!params.horseId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <Suspense fallback={<HorseDetailLoading />}>
        <HorseDetailContent horseId={params.horseId} />
      </Suspense>
    </div>
  );
}

function HorseDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info panel skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Gallery skeleton */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
