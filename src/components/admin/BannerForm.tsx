
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Eye } from 'lucide-react';
import Image from 'next/image';

interface BannerFormData {
  title: string;
  description: string;
  banner_type: 'image' | 'video' | 'html';
  image_url: string;
  video_url: string;
  html_content: string;
  position: string;
  click_url: string;
  target_blank: boolean;
  advertiser_name: string;
  pricing_model: 'cpm' | 'cpc' | 'premium';
  priority: number;
  device_targeting: 'all' | 'mobile' | 'desktop';
}

const INITIAL_FORM_DATA: BannerFormData = {
  title: '',
  description: '',
  banner_type: 'image',
  image_url: '',
  video_url: '',
  html_content: '',
  position: 'header-leaderboard',
  click_url: '',
  target_blank: true,
  advertiser_name: '',
  pricing_model: 'cpm',
  priority: 1,
  device_targeting: 'all'
};

const POSITION_OPTIONS = [
  { value: 'header-leaderboard', label: 'Header Leaderboard (728x90)' },
  { value: 'sidebar-rectangle', label: 'Sidebar Rectangle (300x250)' },
  { value: 'content-mobile', label: 'Content Mobile (320x50)' },
  { value: 'footer-leaderboard', label: 'Footer Leaderboard (728x90)' },
  { value: 'mobile-sticky', label: 'Mobile Sticky (320x50)' },
  { value: 'interstitial', label: 'Interstitial (Full Screen)' }
];

export default function BannerForm({ initialData }: { initialData?: Partial<BannerFormData> }) {
  const router = useRouter();
  const [formData, setFormData] = useState<BannerFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (field: keyof BannerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');

      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/banners/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          handleChange('image_url', result.data.url);
        } else {
          alert('Error subiendo archivo: ' + result.message);
        }
      } else {
        alert('Error en el servidor al subir archivo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error subiendo archivo');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.title || !formData.click_url) {
      alert('Título y URL de destino son requeridos');
      return;
    }

    if (formData.banner_type === 'image' && !formData.image_url) {
      alert('Imagen es requerida para banners de tipo imagen');
      return;
    }

    if (formData.banner_type === 'video' && !formData.video_url) {
      alert('URL de video es requerida para banners de video');
      return;
    }

    if (formData.banner_type === 'html' && !formData.html_content) {
      alert('Contenido HTML es requerido para banners HTML');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Banner creado exitosamente');
        router.push('/admin/banners');
      } else {
        alert('Error creando banner: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error enviando formulario');
    } finally {
      setLoading(false);
    }
  };

  const renderContentInput = () => {
    switch (formData.banner_type) {
      case 'image':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Banner
            </label>
            <div className="space-y-3">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP (MAX. 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </label>
              </div>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Video
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => handleChange('video_url', e.target.value)}
              placeholder="https://ejemplo.com/video.mp4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Formato: MP4, WebM. Máximo 50MB.
            </p>
          </div>
        );

      case 'html':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido HTML
            </label>
            <textarea
              value={formData.html_content}
              onChange={(e) => handleChange('html_content', e.target.value)}
              placeholder='<div style="background: #f0f0f0; padding: 20px; text-align: center;"><h3>Tu Anuncio Aquí</h3></div>'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              HTML seguro. Estilos inline recomendados.
            </p>
          </div>
        );
    }
  };

  const renderPreview = () => {
    if (!preview) return null;

    const getPreviewDimensions = () => {
      switch (formData.position) {
        case 'header-leaderboard':
        case 'footer-leaderboard':
          return 'w-full max-w-[728px] h-[90px]';
        case 'sidebar-rectangle':
          return 'w-[300px] h-[250px]';
        case 'content-mobile':
        case 'mobile-sticky':
          return 'w-full max-w-[320px] h-[50px]';
        case 'interstitial':
          return 'w-full max-w-[600px] h-[400px]';
        default:
          return 'w-full h-[200px]';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Vista Previa del Banner</h3>
            <button
              onClick={() => setPreview(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex justify-center">
            <div className={`${getPreviewDimensions()} border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center`}>
              {formData.banner_type === 'image' && formData.image_url ? (
                <Image
                  src={formData.image_url}
                  alt={formData.title}
                  fill
                  className="object-cover"
                />
              ) : formData.banner_type === 'html' && formData.html_content ? (
                <div dangerouslySetInnerHTML={{ __html: formData.html_content }} />
              ) : formData.banner_type === 'video' && formData.video_url ? (
                <video src={formData.video_url} className="w-full h-full object-cover" controls />
              ) : (
                <div className="text-gray-500 text-center p-4">
                  <div className="text-4xl mb-2">👀</div>
                  <div>Vista previa no disponible</div>
                  <div className="text-sm">Completa los campos requeridos</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700">
              <strong>Posición:</strong> {POSITION_OPTIONS.find(p => p.value === formData.position)?.label}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              <strong>Anunciante:</strong> {formData.advertiser_name || 'No especificado'}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              <strong>URL destino:</strong> {formData.click_url || 'No especificado'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Banner *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ej: Promoción Suplementos Equinos"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anunciante
            </label>
            <input
              type="text"
              value={formData.advertiser_name}
              onChange={(e) => handleChange('advertiser_name', e.target.value)}
              placeholder="Ej: Suplementos Equinos S.A."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Banner *
            </label>
            <select
              value={formData.banner_type}
              onChange={(e) => handleChange('banner_type', e.target.value as 'image' | 'video' | 'html')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="image">Imagen</option>
              <option value="video">Video</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posición *
            </label>
            <select
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {POSITION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Destino *
            </label>
            <input
              type="url"
              value={formData.click_url}
              onChange={(e) => handleChange('click_url', e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo de Precios
            </label>
            <select
              value={formData.pricing_model}
              onChange={(e) => handleChange('pricing_model', e.target.value as 'cpm' | 'cpc' | 'premium')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cpm">CPM (Por mil impresiones)</option>
              <option value="cpc">CPC (Por click)</option>
              <option value="premium">Premium (Pago fijo)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => handleChange('priority', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispositivos Objetivo
            </label>
            <select
              value={formData.device_targeting}
              onChange={(e) => handleChange('device_targeting', e.target.value as 'all' | 'mobile' | 'desktop')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los dispositivos</option>
              <option value="mobile">Solo móviles</option>
              <option value="desktop">Solo escritorio</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descripción opcional del banner..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
          />
        </div>

        {renderContentInput()}

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.target_blank}
              onChange={(e) => handleChange('target_blank', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Abrir en nueva ventana
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            Vista Previa
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Banner'}
          </button>
        </div>
      </form>

      {renderPreview()}
    </>
  );
}
