
// Form component for creating/editing horses
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Horse, CreateHorseData } from '@/lib/hall-of-fame/types';
import { createHorse, updateHorse, getHorseById } from '@/lib/hall-of-fame/services';

interface HorseFormProps {
  horseId?: string;
  initialData?: Horse;
}

export default function HorseForm({ horseId, initialData }: HorseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateHorseData>({
    name: '',
    creator: '',
    genealogy: '',
    additional_notes: '',
    featured: false
  });

  const isEditing = !!horseId;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        creator: initialData.creator || '',
        genealogy: initialData.genealogy || '',
        additional_notes: initialData.additional_notes || '',
        featured: initialData.featured
      });
    } else if (horseId) {
      loadHorse();
    }
  }, [horseId, initialData]);

  const loadHorse = async () => {
    if (!horseId) return;
    
    try {
      setLoading(true);
      const horse = await getHorseById(horseId);
      if (horse) {
        setFormData({
          name: horse.name,
          creator: horse.creator || '',
          genealogy: horse.genealogy || '',
          additional_notes: horse.additional_notes || '',
          featured: horse.featured
        });
      }
    } catch (err) {
      setError('Error al cargar los datos del caballo');
      console.error('Error loading horse:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre del caballo es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        creator: formData.creator?.trim() || undefined,
        genealogy: formData.genealogy?.trim() || undefined,
        additional_notes: formData.additional_notes?.trim() || undefined
      };

      if (isEditing && horseId) {
        await updateHorse(horseId, dataToSubmit);
      } else {
        await createHorse(dataToSubmit);
      }

      router.push('/admin/hall-of-fame');
    } catch (err) {
      setError(isEditing ? 'Error al actualizar el caballo' : 'Error al crear el caballo');
      console.error('Error saving horse:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateHorseData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading && isEditing && !initialData) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Caballo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Ej: Relámpago de Oro"
              required
            />
          </div>

          {/* Creator */}
          <div>
            <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mb-2">
              Criador
            </label>
            <input
              type="text"
              id="creator"
              value={formData.creator}
              onChange={(e) => handleChange('creator', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Ej: Hacienda El Dorado"
            />
          </div>

          {/* Genealogy */}
          <div>
            <label htmlFor="genealogy" className="block text-sm font-medium text-gray-700 mb-2">
              Genealogía
            </label>
            <textarea
              id="genealogy"
              value={formData.genealogy}
              onChange={(e) => handleChange('genealogy', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Ej: Hijo de Trueno Real x Estrella Dorada"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => handleChange('additional_notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Información adicional sobre el caballo, logros, características especiales, etc."
            />
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Marcar como destacado
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/hall-of-fame"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Caballo' : 'Crear Caballo')}
          </button>
        </div>
      </form>
    </div>
  );
}
