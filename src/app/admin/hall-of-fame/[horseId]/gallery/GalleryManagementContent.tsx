
// Gallery management content component
'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Horse, HorseGalleryItem, CreateGalleryItemData } from '@/lib/hall-of-fame/types';
import { 
  getHorseById, 
  getHorseGallery, 
  createGalleryItem, 
  deleteGalleryItem 
} from '@/lib/hall-of-fame/services';
import MediaUpload from '@/components/hall-of-fame/MediaUpload';

interface GalleryManagementContentProps {
  horseId: string;
}

export default function GalleryManagementContent({ horseId }: GalleryManagementContentProps) {
  const [horse, setHorse] = useState<Horse | null>(null);
  const [galleryItems, setGalleryItems] = useState<HorseGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for new gallery item
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    media_url: '',
    media_type: 'image' as 'image' | 'video',
    title: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [horseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [horseData, galleryData] = await Promise.all([
        getHorseById(horseId),
        getHorseGallery(horseId)
      ]);

      if (!horseData) {
        notFound();
        return;
      }

      setHorse(horseData);
      setGalleryItems(galleryData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (mediaUrl: string, mediaType: 'image' | 'video') => {
    setFormData(prev => ({ ...prev, media_url: mediaUrl, media_type: mediaType }));
    setShowForm(true);
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.media_url) {
      setUploadError('Debes subir un archivo primero');
      return;
    }

    try {
      const newItem = await createGalleryItem({
        horse_id: horseId,
        media_url: formData.media_url,
        media_type: formData.media_type,
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined
      });

      setGalleryItems(prev => [newItem, ...prev]);
      setFormData({ media_url: '', media_type: 'image', title: '', description: '' });
      setShowForm(false);
      setUploadError(null);
    } catch (err) {
      setUploadError('Error al agregar el elemento a la galería');
      console.error('Error creating gallery item:', err);
    }
  };

  const handleDelete = async (item: HorseGalleryItem) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      return;
    }

    setDeletingId(item.id);
    try {
      await deleteGalleryItem(item.id);
      setGalleryItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      alert('Error al eliminar el elemento');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelForm = () => {
    setFormData({ media_url: '', media_type: 'image', title: '', description: '' });
    setShowForm(false);
    setUploadError(null);
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
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Caballo no encontrado'}</div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galería de {horse.name}</h1>
          <p className="text-gray-600">Gestiona las fotos y videos del caballo</p>
        </div>
        <Link
          href={`/admin/hall-of-fame/${horse.id}/edit`}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Editar Caballo
        </Link>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Elemento</h2>
        
        {!showForm ? (
          <div>
            <MediaUpload
              onUpload={handleMediaUpload}
              onError={setUploadError}
            />
            {uploadError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}

            {/* Preview */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {formData.media_type === 'image' ? (
                  <img
                    src={formData.media_url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <video
                    src={formData.media_url}
                    className="w-16 h-16 object-cover rounded"
                    muted
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {formData.media_type === 'image' ? 'Imagen' : 'Video'} subido correctamente
                </p>
                <p className="text-xs text-gray-500">Completa la información adicional</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título (opcional)
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Título descriptivo del elemento"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Descripción del elemento"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Agregar a Galería
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Gallery Items */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Elementos de la Galería
            </h2>
            <span className="text-sm text-gray-600">
              {galleryItems.length} elemento{galleryItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {galleryItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-30">📸</div>
              <p className="text-gray-600">No hay elementos en la galería</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map(item => (
                <div key={item.id} className="relative group border rounded-lg overflow-hidden">
                  {/* Media */}
                  <div className="aspect-square relative bg-gray-100">
                    {item.media_type === 'image' ? (
                      <img
                        src={item.media_url}
                        alt={item.title || 'Imagen de galería'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.media_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        {deletingId === item.id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    {item.title && (
                      <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {item.media_type === 'image' ? '📷' : '🎥'} {item.media_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        ❤️ {item.likes_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
