
// Admin Hall of Fame content component
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Horse } from '@/lib/hall-of-fame/types';
import { getHorses, deleteHorse } from '@/lib/hall-of-fame/services';

export default function AdminHallOfFameContent() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHorses();
  }, []);

  const loadHorses = async () => {
    try {
      setLoading(true);
      const data = await getHorses();
      setHorses(data);
    } catch (err) {
      setError('Error al cargar los caballos');
      console.error('Error loading horses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (horse: Horse) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${horse.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeletingId(horse.id);
    try {
      await deleteHorse(horse.id);
      setHorses(prevHorses => prevHorses.filter(h => h.id !== horse.id));
    } catch (err) {
      console.error('Error deleting horse:', err);
      alert('Error al eliminar el caballo');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: horses.length,
    featured: horses.filter(h => h.featured).length,
    recent: horses.filter(h => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(h.created_at) > weekAgo;
    }).length,
    thisMonth: horses.filter(h => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(h.created_at) > monthAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadHorses}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600">Total de Caballos</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600">Destacados</div>
          <div className="text-2xl font-bold text-amber-600">{stats.featured}</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600">Esta Semana</div>
          <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600">Este Mes</div>
          <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Caballos Registrados</h2>
        <Link
          href="/admin/hall-of-fame/new"
          className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Caballo
        </Link>
      </div>

      {/* Horses Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {horses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-30">🐎</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay caballos registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando el primer caballo al Hall of Fame
            </p>
            <Link
              href="/admin/hall-of-fame/new"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Agregar Primer Caballo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caballo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {horses.map(horse => (
                  <tr key={horse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-amber-700">
                              {horse.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {horse.name}
                          </div>
                          {horse.genealogy && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {horse.genealogy}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {horse.creator || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {horse.featured ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Destacado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(horse.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/hall-of-fame/${horse.id}`}
                          className="text-amber-600 hover:text-amber-900 transition-colors"
                          title="Ver"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/hall-of-fame/${horse.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/hall-of-fame/${horse.id}/gallery`}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Galería"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(horse)}
                          disabled={deletingId === horse.id}
                          className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === horse.id ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
