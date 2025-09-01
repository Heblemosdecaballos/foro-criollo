
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff, BarChart3 } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  position: string;
  banner_type: string;
  advertiser_name?: string;
  pricing_model: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  image_url?: string;
}

export default function BannerAdminTable() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await fetch('/api/banners?limit=50');
      const result = await response.json();
      
      if (result.success) {
        setBanners(result.data || []);
      } else {
        setError('Error cargando banners');
      }
    } catch (err) {
      console.error('Error loading banners:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      // En una implementación real, habría un endpoint PUT para actualizar
      console.log(`Toggle banner ${bannerId} from ${currentStatus} to ${!currentStatus}`);
      
      // Actualizar estado local
      setBanners(prev => prev.map(banner => 
        banner.id === bannerId 
          ? { ...banner, is_active: !currentStatus }
          : banner
      ));
    } catch (err) {
      console.error('Error toggling banner status:', err);
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) {
      return;
    }

    try {
      // En una implementación real, habría un endpoint DELETE
      console.log(`Delete banner ${bannerId}`);
      
      // Actualizar estado local
      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      'header-leaderboard': 'Header (728x90)',
      'sidebar-rectangle': 'Sidebar (300x250)',
      'content-mobile': 'Móvil (320x50)',
      'footer-leaderboard': 'Footer (728x90)',
      'mobile-sticky': 'Sticky Móvil',
      'interstitial': 'Interstitial'
    };
    return labels[position] || position;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'html': return '💻';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
        <p className="text-gray-600 mt-2">Cargando banners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2">⚠️ {error}</div>
        <button 
          onClick={loadBanners}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Banner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posición
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Anunciante
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modelo
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
          {banners.map((banner) => (
            <tr key={banner.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">
                    {getTypeIcon(banner.banner_type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {banner.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      Prioridad: {banner.priority}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getPositionLabel(banner.position)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {banner.advertiser_name || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  banner.pricing_model === 'premium' ? 'bg-purple-100 text-purple-800' :
                  banner.pricing_model === 'cpc' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {banner.pricing_model?.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    banner.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  } transition-colors cursor-pointer`}
                >
                  {banner.is_active ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Activo
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inactivo
                    </>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/banners/${banner.id}/stats`}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver estadísticas"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📢</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay banners registrados
          </h3>
          <p className="text-gray-600 mb-4">
            Crea tu primer banner para comenzar a generar ingresos
          </p>
          <Link
            href="/admin/banners/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Crear Primer Banner
          </Link>
        </div>
      )}
    </div>
  );
}
