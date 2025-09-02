
// Página de gestión de hilos/foros
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  category: string;
  author_id: string;
  created_at: string;
  replies_count: number;
  views: number;
  status: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function ThreadsManagement() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadThreads();
  }, [filter]);

  async function loadThreads() {
    try {
      setLoading(true);
      let query = supabase
        .from('threads')
        .select(`
          *,
          profiles:author_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setThreads(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateThreadStatus(threadId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('threads')
        .update({ status: newStatus })
        .eq('id', threadId);

      if (error) throw error;
      
      // Actualizar la lista local
      setThreads(threads.map(thread => 
        thread.id === threadId ? { ...thread, status: newStatus } : thread
      ));
    } catch (err: any) {
      alert('Error actualizando estado: ' + err.message);
    }
  }

  async function deleteThread(threadId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este hilo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;
      
      // Remover de la lista local
      setThreads(threads.filter(thread => thread.id !== threadId));
    } catch (err: any) {
      alert('Error eliminando hilo: ' + err.message);
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'aprendizaje': 'bg-blue-100 text-blue-800',
      'debate': 'bg-red-100 text-red-800',
      'negocios': 'bg-green-100 text-green-800',
      'veterinaria': 'bg-purple-100 text-purple-800',
      'entrenamiento': 'bg-yellow-100 text-yellow-800',
      'noticias': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Hilos">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800">Cargando hilos...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Gestión de Hilos">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error cargando hilos: {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Hilos">
      <div className="space-y-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({threads.length})
            </button>
            {['aprendizaje', 'debate', 'negocios', 'veterinaria', 'entrenamiento', 'noticias'].map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  filter === category 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de hilos */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Hilos del Foro</h2>
            <p className="text-gray-600 mt-2">
              {filter === 'all' ? 'Todos los hilos' : `Categoría: ${filter}`} - Total: {threads.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {threads.map((thread) => (
                  <tr key={thread.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {thread.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(thread.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(thread.category)}`}>
                        {thread.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {thread.profiles?.full_name || 'Usuario eliminado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>💬 {thread.replies_count} respuestas</div>
                      <div>👁️ {thread.views} vistas</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(thread.status)}`}>
                        {thread.status === 'open' ? 'Abierto' : 'Archivado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/foros/${thread.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => updateThreadStatus(thread.id, thread.status === 'open' ? 'archived' : 'open')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {thread.status === 'open' ? 'Archivar' : 'Abrir'}
                      </button>
                      <button
                        onClick={() => deleteThread(thread.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {threads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay hilos en esta categoría</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
