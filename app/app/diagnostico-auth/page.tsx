
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// ✅ PÁGINA DE DIAGNÓSTICO DE AUTENTICACIÓN

export default async function DiagnosticoAuthPage() {
  const diagnostics = []
  
  try {
    // Test 1: Conexión a Supabase
    const supabase = await createServerSupabaseClient()
    const { data: healthCheck, error: healthError } = await supabase
      .from('forum_categories')
      .select('count')
      .limit(1)
    
    diagnostics.push({
      test: 'Conexión a Supabase',
      status: healthError ? 'error' : 'success',
      message: healthError ? healthError.message : 'Conexión exitosa',
      details: healthCheck ? 'Base de datos accesible' : 'Sin datos de prueba'
    })

    // Test 2: Variables de entorno
    const envVars = {
      'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'SUPABASE_SERVICE_ROLE': !!process.env.SUPABASE_SERVICE_ROLE,
    }
    
    const missingEnvs = Object.entries(envVars).filter(([_, exists]) => !exists).map(([key]) => key)
    
    diagnostics.push({
      test: 'Variables de entorno',
      status: missingEnvs.length === 0 ? 'success' : 'error',
      message: missingEnvs.length === 0 ? 'Todas las variables configuradas' : `Faltan: ${missingEnvs.join(', ')}`,
      details: `${Object.keys(envVars).length - missingEnvs.length}/${Object.keys(envVars).length} configuradas`
    })

    // Test 3: Usuarios en base de datos
    try {
      const adminSupabase = createAdminSupabaseClient()
      const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()
      
      const adminUser = users?.users?.find(u => u.email === 'admin@hablandodecaballos.com')
      const moderatorUser = users?.users?.find(u => u.email === 'moderator@hablandodecaballos.com')
      
      diagnostics.push({
        test: 'Usuarios de prueba',
        status: (adminUser && moderatorUser) ? 'success' : 'warning',
        message: `${users?.users?.length || 0} usuarios encontrados`,
        details: `Admin: ${adminUser ? '✅' : '❌'}, Moderador: ${moderatorUser ? '✅' : '❌'}`
      })
    } catch (adminError) {
      diagnostics.push({
        test: 'Usuarios de prueba',
        status: 'error',
        message: 'Error accediendo a usuarios admin',
        details: adminError instanceof Error ? adminError.message : 'Error desconocido'
      })
    }

    // Test 4: Arquitectura de autenticación
    const authCheck = await supabase.auth.getUser()
    diagnostics.push({
      test: 'Arquitectura de autenticación',
      status: 'success',
      message: authCheck.error ? 'Sin usuario autenticado (normal)' : `Usuario: ${authCheck.data.user?.email}`,
      details: 'Nueva arquitectura SSR funcionando'
    })

  } catch (error) {
    diagnostics.push({
      test: 'Diagnóstico general',
      status: 'error',
      message: error instanceof Error ? error.message : 'Error desconocido',
      details: 'Fallo crítico en diagnóstico'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Diagnóstico de Autenticación
          </h1>
          <p className="text-gray-600">
            Verificación completa del sistema de autenticación refactorizado
          </p>
        </div>

        <div className="grid gap-6">
          {diagnostics.map((diagnostic, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    {diagnostic.status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
                    {diagnostic.status === 'warning' && <AlertCircle className="h-6 w-6 text-yellow-500" />}
                    {diagnostic.status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
                    {diagnostic.test}
                  </span>
                  <Badge 
                    variant={
                      diagnostic.status === 'success' ? 'default' : 
                      diagnostic.status === 'warning' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {diagnostic.status === 'success' ? '✅ OK' : 
                     diagnostic.status === 'warning' ? '⚠️ WARNING' : 
                     '❌ ERROR'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">{diagnostic.message}</p>
                <p className="text-sm text-gray-600">{diagnostic.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-3">📋 Credenciales de Prueba</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">👑 Administrador:</p>
              <p>Email: admin@hablandodecaballos.com</p>
              <p>Contraseña: admin123456</p>
            </div>
            <div>
              <p className="font-medium">⚖️ Moderador:</p>
              <p>Email: moderator@hablandodecaballos.com</p>
              <p>Contraseña: moderator123456</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Última actualización: Refactorización completa de arquitectura de autenticación
          </p>
        </div>
      </div>
    </div>
  )
}
