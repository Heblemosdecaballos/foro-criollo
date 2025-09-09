
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

// ✅ PÁGINA DE CONFIGURACIÓN DE VERCEL

export default function ConfigurarVercelPage() {
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  const envVars = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: 'https://bjowdmfaybftlunrdgpe.supabase.co',
      description: 'URL de la instancia de Supabase',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqb3dkbWZheWJmdGx1bnJkZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NjcyMjYsImV4cCI6MjA3MDQ0MzIyNn0.awdh3dQV00US9gOaRCb5EOBOYCH5qkLQlSH8LQLRy0o',
      description: 'Clave pública de Supabase para el cliente',
      required: true
    },
    {
      name: 'SUPABASE_SERVICE_ROLE',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqb3dkbWZheWJmdGx1bnJkZ3BlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2NzIyNiwiZXhwIjoyMDcwNDQzMjI2fQ.7F9Mj0eijM4SGA2azKWQ3nDXrjQzf0YHDBVavjOtdT8',
      description: 'Clave administrativa de Supabase para operaciones de backend',
      required: true
    },
    {
      name: 'HALL_ADMIN_EMAIL',
      value: 'admin@hablandodecaballos.com',
      description: 'Email del administrador principal',
      required: false
    },
    {
      name: 'FORUM_MOD_EMAIL',
      value: 'moderator@hablandodecaballos.com',
      description: 'Email del moderador de foros',
      required: false
    },
    {
      name: 'AWS_PROFILE',
      value: 'hosted_storage',
      description: 'Perfil de AWS para almacenamiento',
      required: true
    },
    {
      name: 'AWS_REGION',
      value: 'us-west-2',
      description: 'Región de AWS',
      required: true
    },
    {
      name: 'AWS_BUCKET_NAME',
      value: 'abacusai-apps-5173e6222d3e469c3a48fdd3-us-west-2',
      description: 'Nombre del bucket de S3',
      required: true
    },
    {
      name: 'AWS_FOLDER_PREFIX',
      value: '350/',
      description: 'Prefijo para archivos en S3',
      required: true
    }
  ]

  const copyToClipboard = (text: string, varName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedVar(varName)
    setTimeout(() => setCopiedVar(null), 2000)
  }

  // Verificar si estamos en desarrollo y las variables están disponibles
  const isCurrentlyConfigured = (varName: string) => {
    if (typeof window !== 'undefined') {
      return false // En cliente no podemos verificar env vars del servidor
    }
    return true // Asumimos que están configuradas para esta demo
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔧 Configurar Variables de Entorno en Vercel
          </h1>
          <p className="text-gray-600">
            El sitio está devolviendo Error 503 porque las variables de entorno no están configuradas en Vercel
          </p>
        </div>

        <Alert className="mb-8 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>🚨 PROBLEMA CRÍTICO IDENTIFICADO:</strong><br />
            Las variables de entorno existen localmente pero NO están configuradas en Vercel.<br />
            Esto causa que la aplicación crashee inmediatamente al intentar cargar.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Pasos para Configurar en Vercel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">📋 Instrucciones paso a paso:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Ve a <strong>vercel.com</strong> → Tu proyecto <strong>"hablandodecaballos"</strong></li>
                  <li>Click en <strong>"Settings"</strong> en el menú superior</li>
                  <li>Click en <strong>"Environment Variables"</strong> en el menú lateral</li>
                  <li>Para cada variable de abajo, click <strong>"Add New"</strong>:</li>
                  <li className="ml-4">• Name: <code className="bg-white px-2 py-1 rounded">NOMBRE_VARIABLE</code></li>
                  <li className="ml-4">• Value: <code className="bg-white px-2 py-1 rounded">valor_copiado</code></li>
                  <li className="ml-4">• Environment: Selecciona <strong>"Production"</strong></li>
                  <li>Click <strong>"Save"</strong> para cada variable</li>
                  <li>Una vez agregadas todas, haz <strong>"Redeploy"</strong> del sitio</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">📝 Variables a Configurar:</h2>
          
          {envVars.map((envVar, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-3">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {envVar.name}
                    </code>
                    <Badge variant={envVar.required ? 'destructive' : 'secondary'}>
                      {envVar.required ? 'REQUERIDA' : 'OPCIONAL'}
                    </Badge>
                  </div>
                  <button
                    onClick={() => copyToClipboard(envVar.value, envVar.name)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    {copiedVar === envVar.name ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Valor
                      </>
                    )}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{envVar.description}</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-xs break-all text-gray-800 font-mono">
                    {envVar.value}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold mb-3 text-green-800">✅ Después de Configurar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
            <li>Vercel automáticamente hará redeploy</li>
            <li>El sitio debería cargar correctamente (ya no Error 503)</li>
            <li>Todas las funcionalidades estarán operativas</li>
            <li>Puedes probar el login con credenciales ACTUALIZADAS:</li>
          </ol>
          <div className="mt-4 p-4 bg-white rounded border-2 border-green-300">
            <h4 className="font-bold text-green-800 mb-2">🔑 CREDENCIALES DE LOGIN CORRECTAS:</h4>
            <p className="text-sm"><strong>📧 Email:</strong> admin@hablandodecaballos.com</p>
            <p className="text-sm"><strong>🔒 Password:</strong> HablandoDeCallos2025!</p>
            <p className="text-xs text-green-600 mt-2">✅ Credenciales verificadas y funcionales (Enero 2025)</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Una vez configuradas las variables, el sitio debería funcionar completamente
          </p>
        </div>
      </div>
    </div>
  )
}
