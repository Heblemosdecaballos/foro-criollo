
// Component for displaying horse cards in the Hall of Fame
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Horse } from '@/lib/hall-of-fame/types';

interface HorseCardProps {
  horse: Horse;
}

export default function HorseCard({ horse }: HorseCardProps) {
  return (
    <Link href={`/hall-of-fame/${horse.id}`}>
      <div className="group relative overflow-hidden rounded-xl border bg-white/70 backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg">
        {/* Featured badge */}
        {horse.featured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              ⭐ Destacado
            </span>
          </div>
        )}

        {/* Horse image placeholder or actual image */}
        <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
          <div className="text-6xl opacity-30">🐎</div>
        </div>

        {/* Horse information */}
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
            {horse.name}
          </h3>
          
          {horse.creator && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Criador:</span> {horse.creator}
            </p>
          )}

          {horse.genealogy && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              <span className="font-medium">Genealogía:</span> {horse.genealogy}
            </p>
          )}

          {horse.additional_notes && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-3">
              {horse.additional_notes}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {new Date(horse.created_at).toLocaleDateString('es-ES')}
            </span>
            <span className="text-sm text-amber-600 font-medium group-hover:text-amber-700">
              Ver detalles →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
