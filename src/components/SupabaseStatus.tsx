
// Componente para mostrar el estado de Supabase
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SupabaseStatus() {
  const [isDemo, setIsDemo] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const isDemoCredentials = 
      !supabaseUrl || 
      !supabaseKey || 
      supabaseUrl.includes('demo-project') || 
      supabaseUrl.includes('example') ||
      supabaseKey.includes('demo-key') ||
      supabaseKey.includes('placeholder');
    
    setIsDemo(isDemoCredentials);
    setShowBanner(isDemoCredentials);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">Modo Demo - Configuración Requerida</p>
            <p className="text-sm opacity-90">
              Para funcionalidad completa, configura las credenciales reales de Supabase
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/setup"
            className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Configurar Ahora
          </Link>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
