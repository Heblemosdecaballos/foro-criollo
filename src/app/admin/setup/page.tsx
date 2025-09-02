
// Página de configuración inicial del administrador
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSetup() {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceKey: ''
  });

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-800 mb-4">
              🐎 Configuración de Administrador
            </h1>
            <p className="text-amber-700 text-lg">
              Configura tu usuario administrador para gestionar el foro
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Supabase Setup */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Paso 1: Configurar Supabase
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    📋 Instrucciones para Supabase
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-blue-700">
                    <li>Ve a <a href="https://supabase.com" target="_blank" className="underline">https://supabase.com</a></li>
                    <li>Crea una cuenta o inicia sesión</li>
                    <li>Crea un nuevo proyecto</li>
                    <li>Ve a Settings → API</li>
                    <li>Copia las credenciales que necesitamos abajo</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project URL
                    </label>
                    <input
                      type="url"
                      value={credentials.supabaseUrl}
                      onChange={(e) => handleCredentialChange('supabaseUrl', e.target.value)}
                      placeholder="https://tu-proyecto.supabase.co"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anon/Public Key
                    </label>
                    <textarea
                      value={credentials.supabaseAnonKey}
                      onChange={(e) => handleCredentialChange('supabaseAnonKey', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Role Key (Opcional - para crear usuario automáticamente)
                    </label>
                    <textarea
                      value={credentials.supabaseServiceKey}
                      onChange={(e) => handleCredentialChange('supabaseServiceKey', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link
                    href="/admin"
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Volver
                  </Link>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!credentials.supabaseUrl || !credentials.supabaseAnonKey}
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Generate Config */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Paso 2: Configuración Generada
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    ✅ Configuración Lista
                  </h3>
                  <p className="text-green-700 mb-4">
                    Copia el siguiente contenido y reemplaza tu archivo <code>.env.local</code>:
                  </p>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`# Supabase Configuration - PRODUCCIÓN
NEXT_PUBLIC_SUPABASE_URL=${credentials.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${credentials.supabaseAnonKey}
${credentials.supabaseServiceKey ? `SUPABASE_SERVICE_ROLE_KEY=${credentials.supabaseServiceKey}` : '# SUPABASE_SERVICE_ROLE_KEY=tu-service-key-aqui'}

# Datos del administrador
ADMIN_EMAIL=admin@hablandodecaballos.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=Admin1234
ADMIN_FULL_NAME=Administrador del Foro

# Otras configuraciones
HALL_ADMIN_EMAIL=admin@hablandodecaballos.com
JWT_SECRET=hablando-de-caballos-super-secret-jwt-key-2024
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UC_HablandoDeCaballos
NEXT_PUBLIC_SITE_URL=http://localhost:3000`}</pre>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(`# Supabase Configuration - PRODUCCIÓN
NEXT_PUBLIC_SUPABASE_URL=${credentials.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${credentials.supabaseAnonKey}
${credentials.supabaseServiceKey ? `SUPABASE_SERVICE_ROLE_KEY=${credentials.supabaseServiceKey}` : '# SUPABASE_SERVICE_ROLE_KEY=tu-service-key-aqui'}

# Datos del administrador
ADMIN_EMAIL=admin@hablandodecaballos.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=Admin1234
ADMIN_FULL_NAME=Administrador del Foro

# Otras configuraciones
HALL_ADMIN_EMAIL=admin@hablandodecaballos.com
JWT_SECRET=hablando-de-caballos-super-secret-jwt-key-2024
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UC_HablandoDeCaballos
NEXT_PUBLIC_SITE_URL=http://localhost:3000`)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📋 Copiar Configuración
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                    ⚠️ Importante
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-yellow-700">
                    <li>Guarda una copia de seguridad de tu archivo <code>.env.local</code> actual</li>
                    <li>Reemplaza el contenido completo del archivo</li>
                    <li>Reinicia el servidor de desarrollo después de los cambios</li>
                    <li>Asegúrate de que tu proyecto Supabase tenga las tablas necesarias</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Create Admin User */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Paso 3: Crear Usuario Administrador
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    👤 Datos del Administrador
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                    <div>
                      <strong>Email:</strong> admin@hablandodecaballos.com
                    </div>
                    <div>
                      <strong>Usuario:</strong> Admin
                    </div>
                    <div>
                      <strong>Contraseña:</strong> Admin1234
                    </div>
                    <div>
                      <strong>Rol:</strong> Administrador
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🔧 Comandos para Ejecutar
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Después de actualizar tu archivo <code>.env.local</code>, ejecuta estos comandos:
                  </p>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-2">
                    <div># 1. Reiniciar el servidor</div>
                    <div>npm run dev</div>
                    <div></div>
                    <div># 2. Crear usuario administrador (en otra terminal)</div>
                    <div>node scripts/createAdmin.js</div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard('npm run dev\nnode scripts/createAdmin.js')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📋 Copiar Comandos
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    🎉 ¡Listo!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Una vez completados los pasos anteriores, podrás:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-green-700">
                    <li>Iniciar sesión como administrador</li>
                    <li>Gestionar usuarios y roles</li>
                    <li>Moderar foros y contenido</li>
                    <li>Administrar el Hall of Fame</li>
                    <li>Acceder a todas las funciones administrativas</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <Link
                    href="/admin"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Ir al Panel Admin
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
