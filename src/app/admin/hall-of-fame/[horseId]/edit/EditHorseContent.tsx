
// Edit horse content component
'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Horse } from '@/lib/hall-of-fame/types';
import { getHorseById } from '@/lib/hall-of-fame/services';
import HorseForm from '../../HorseForm';

interface EditHorseContentProps {
  horseId: string;
}

export default function EditHorseContent({ horseId }: EditHorseContentProps) {
  const [horse, setHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHorse();
  }, [horseId]);

  const loadHorse = async () => {
    try {
      setLoading(true);
      const data = await getHorseById(horseId);
      if (!data) {
        notFound();
        return;
      }
      setHorse(data);
    } catch (err) {
      setError('Error al cargar los datos del caballo');
      console.error('Error loading horse:', err);
    } finally {
      setLoading(false);
    }
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
          onClick={loadHorse}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return <HorseForm horseId={horseId} initialData={horse} />;
}
