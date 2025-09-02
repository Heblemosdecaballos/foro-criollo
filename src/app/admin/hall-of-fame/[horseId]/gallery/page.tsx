
// Gallery management page
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryManagementContent from './GalleryManagementContent';

interface Props {
  params: { horseId: string };
}

export const metadata: Metadata = {
  title: 'Gestionar Galería - Hall of Fame Admin',
  description: 'Gestionar fotos y videos del caballo',
};

export default function GalleryManagementPage({ params }: Props) {
  if (!params.horseId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<GalleryManagementLoading />}>
        <GalleryManagementContent horseId={params.horseId} />
      </Suspense>
    </div>
  );
}

function GalleryManagementLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
      <div className="bg-white rounded-lg border p-6">
        <div className="h-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
