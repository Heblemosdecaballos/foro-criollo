
// Client component for horse detail page
'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Horse, HorseGalleryItem } from '@/lib/hall-of-fame/types';
import { getHorseById, getHorseGallery } from '@/lib/hall-of-fame/services';
import { useAuth } from '@/hooks/useAuth';
import GalleryItem from '@/components/hall-of-fame/GalleryItem';

interface HorseDetailContentProps {
  horseId: string;
}

export default function HorseDetailContent({ horseId }: HorseDetailContentProps) {
  const { user, isAdmin } = useAuth();
  const [horse, setHorse] = useState<Horse | null>(null);
  const [galleryItems, setGalleryItems] = useState<HorseGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHorseData();
  }, [horseId, user]);

  const loadHorseData = async () => {
    try {
      setLoading(true);
      
      // Load horse details and gallery in parallel
      const [horseData, galleryData] = await Promise.all([
        getHorseById(horseId),
        getHorseGallery(horseId, user?.id)
      ]);

      if (!horseData) {
        notFound();
        return;
      }

      setHorse(horseData);
      setGalleryItems(galleryData);
    } catch (err) {
      setError('Error al cargar los datos del caballo');
      console.error('Error loading horse data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeUpdate = (itemId: string, newLikesCount: number, userLiked: boolean) => {
    setGalleryItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, likes_count: newLikesCount, user_has_liked: userLiked }
          : item
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error || 'Caballo no encontrado'}</div>
          <Link
            href="/hall-of-fame"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Volver al Hall of Fame
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/hall-of-fame" className="hover:text-amber-600 transition-colors">
          Hall of Fame
        </Link>
        <span>›</span>
        <span className="text-gray-900">{horse.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
              {horse.name}
            </h1>
            {horse.featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⭐ Destacado
              </span>
            )}
          </div>
          {horse.creator && (
            <p className="text-lg text-gray-600">
              <span className="font-medium">Criador:</span> {horse.creator}
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link
              href={`/admin/hall-of-fame/${horse.id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Link>
            <Link
              href={`/admin/hall-of-fame/${horse.id}/gallery`}
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Media
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Horse Information Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border p-6 sticky top-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-4">
              Información del Ejemplar
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Nombre</h3>
                <p className="text-gray-700">{horse.name}</p>
              </div>

              {horse.creator && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Criador</h3>
                  <p className="text-gray-700">{horse.creator}</p>
                </div>
              )}

              {horse.genealogy && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Genealogía</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{horse.genealogy}</p>
                </div>
              )}

              {horse.additional_notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Notas Adicionales</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{horse.additional_notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Fecha de Registro</h3>
                <p className="text-gray-700">
                  {new Date(horse.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-semibold text-gray-900">
              Galería
            </h2>
            <span className="text-sm text-gray-600">
              {galleryItems.length} elemento{galleryItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {galleryItems.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-gray-300">
              <div className="text-6xl mb-4 opacity-30">📸</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay elementos en la galería
              </h3>
              <p className="text-gray-600">
                {isAdmin 
                  ? 'Agrega fotos y videos para mostrar este ejemplar'
                  : 'Las fotos y videos aparecerán aquí cuando sean agregados'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {galleryItems.map(item => (
                <GalleryItem
                  key={item.id}
                  item={item}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
