
'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, User, Key, Database, Cookie } from 'lucide-react'

export default function DiagnosticoAuthPage() {
  const { supabase, user, isLoading } = useSupabase()
  const [diagnostico, setDiagnostico] = useState<any>({})
  const [isDiagnosing, setIsDiagnosing] = useState(false)

  const ejecutarDiagnostico = async () => {
    setIsDiagnosing(true)
    const resultado: any = {
      timestamp: new Date().toISOString(),
      client: {},
      server: {},
      cookies: {},
      localStorage: {},
      supabase: {}
    }

    try {
      // 1. Estado del cliente
      resultado.client = {
        userFromProvider: user ? {
          id: user.id,
          email: user.email,
          aud: user.aud,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email_confirmed_at: user.email_confirmed_at
        } : null,
        isLoading: isLoading
      }

      // 2. Session directa de Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      resultado.supabase.session = sessionData?.session ? {
        access_token: sessionData.session.access_token ? 'EXISTS' : 'MISSING',
        refresh_token: sessionData.session.refresh_token ? 'EXISTS' : 'MISSING',
        user: sessionData.session.user ? {
          id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          aud: sessionData.session.user.aud,
          role: sessionData.session.user.role
        } : null,
        expires_at: sessionData.session.expires_at
      } : null
      resultado.supabase.sessionError = sessionError

      // 3. User directo de Supabase
      const { data: userData, error: userError } = await supabase.auth.getUser()
      resultado.supabase.user = userData?.user ? {
        id: userData.user.id,
        email: userData.user.email,
        aud: userData.user.aud,
        role: userData.user.role
      } : null
      resultado.supabase.userError = userError

      // 4. Cookies del navegador
      if (typeof document !== 'undefined') {
        resultado.cookies = {
          all: document.cookie,
          supabaseCookies: document.cookie.split(';').filter(c => c.includes('supabase')),
          hasAuthToken: document.cookie.includes('sb-') || document.cookie.includes('supabase')
        }
      }

      // 5. LocalStorage
      if (typeof window !== 'undefined') {
        resultado.localStorage = {
          supabaseAuth: localStorage.getItem('supabase.auth.token'),
          keys: Object.keys(localStorage).filter(k => k.includes('supabase'))
        }
      }

      // 6. Test API call
      try {
        const response = await fetch('/api/horses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        resultado.server.apiTest = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          ok: response.ok
        }
      } catch (apiError: any) {
        resultado.server.apiTestError = apiError.message
      }

      // 7. Middleware test
      try {
        const middlewareResponse = await fetch('/admin', {
          method: 'HEAD'
        })
        resultado.server.middlewareTest = {
          status: middlewareResponse.status,
          redirected: middlewareResponse.redirected,
          url: middlewareResponse.url
        }
      } catch (middlewareError: any) {
        resultado.server.middlewareError = middlewareError.message
      }

      setDiagnostico(resultado)
      
    } catch (error: any) {
      resultado.error = error.message
      setDiagnostico(resultado)
    } finally {
      setIsDiagnosing(false)
    }
  }

  const repararSesion = async () => {
    try {
      console.log('Intentando reparar sesión...')
      
      // 1. Refresh session
      const { data, error } = await supabase.auth.refreshSession()
      console.log('Refresh result:', { data, error })
      
      // 2. Re-run diagnostico
      setTimeout(ejecutarDiagnostico, 1000)
      
    } catch (error) {
      console.error('Error reparando sesión:', error)
    }
  }

  useEffect(() => {
    // Auto-ejecutar diagnóstico al cargar
    ejecutarDiagnostico()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Database className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#4B2E2E] mb-2">Diagnóstico de Autenticación</h1>
          <p className="text-gray-600">Análisis completo del sistema de login para identificar el problema</p>
        </div>

        <div className="grid gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Controles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={ejecutarDiagnostico}
                  disabled={isDiagnosing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isDiagnosing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Diagnosticando...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Ejecutar Diagnóstico
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={repararSesion}
                  variant="outline"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Reparar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {Object.keys(diagnostico).length > 0 && (
            <>
              {/* Estado del Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Estado del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant={diagnostico.client?.userFromProvider ? "default" : "destructive"}>
                    {diagnostico.client?.userFromProvider ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <strong>Usuario del Provider:</strong> {diagnostico.client?.userFromProvider ? 
                        `✅ ${diagnostico.client.userFromProvider.email} (${diagnostico.client.userFromProvider.id})` : 
                        '❌ NO DETECTADO'}
                    </AlertDescription>
                  </Alert>
                  <pre className="text-xs bg-gray-100 p-4 rounded mt-4 overflow-auto">
{JSON.stringify(diagnostico.client, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Estado de Supabase */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Estado de Supabase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant={diagnostico.supabase?.session ? "default" : "destructive"}>
                    {diagnostico.supabase?.session ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <strong>Sesión de Supabase:</strong> {diagnostico.supabase?.session ? 
                        `✅ ACTIVA - ${diagnostico.supabase.session.user?.email}` : 
                        '❌ NO ENCONTRADA'}
                    </AlertDescription>
                  </Alert>
                  <pre className="text-xs bg-gray-100 p-4 rounded mt-4 overflow-auto">
{JSON.stringify(diagnostico.supabase, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Estado del Servidor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Estado del Servidor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant={diagnostico.server?.apiTest?.ok ? "default" : "destructive"}>
                    {diagnostico.server?.apiTest?.ok ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <strong>API Test:</strong> {diagnostico.server?.apiTest?.ok ? 
                        `✅ Status ${diagnostico.server.apiTest.status}` : 
                        `❌ Status ${diagnostico.server?.apiTest?.status || 'ERROR'}`}
                    </AlertDescription>
                  </Alert>
                  <pre className="text-xs bg-gray-100 p-4 rounded mt-4 overflow-auto">
{JSON.stringify(diagnostico.server, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Cookies y Storage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cookie className="mr-2 h-5 w-5" />
                    Cookies y LocalStorage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant={diagnostico.cookies?.hasAuthToken ? "default" : "destructive"}>
                    {diagnostico.cookies?.hasAuthToken ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <strong>Cookies de Auth:</strong> {diagnostico.cookies?.hasAuthToken ? 
                        '✅ ENCONTRADAS' : 
                        '❌ NO ENCONTRADAS'}
                    </AlertDescription>
                  </Alert>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="font-semibold mb-2">Cookies:</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
{JSON.stringify(diagnostico.cookies, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">LocalStorage:</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
{JSON.stringify(diagnostico.localStorage, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamp */}
              <Card>
                <CardContent className="text-center pt-6">
                  <p className="text-sm text-gray-500">
                    Última actualización: {new Date(diagnostico.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
