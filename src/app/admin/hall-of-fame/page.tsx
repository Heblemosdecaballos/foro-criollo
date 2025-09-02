
// Admin Hall of Fame management page
import { Suspense } from 'react';
import { Metadata } from 'next';
import AdminHallOfFameContent from './AdminHallOfFameContent';

export const metadata: Metadata = {
  title: 'Administrar Hall of Fame - Admin',
  description: 'Gestión de caballos en el Hall of Fame',
};

export const dynamic = 'force-dynamic';

export default function AdminHallOfFamePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hall of Fame</h1>
          <p className="text-gray-600">Gestiona los caballos destacados y su contenido</p>
        </div>
      </div>

      <Suspense fallback={<AdminHallOfFameLoading />}>
        <AdminHallOfFameContent />
      </Suspense>
    </div>
  );
}

function AdminHallOfFameLoading() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg border p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
