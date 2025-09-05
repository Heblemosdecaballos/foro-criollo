
'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, User, Key } from 'lucide-react'
import Link from 'next/link'

export default function VerificarLoginPage() {
  const { supabase, user } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loginResult, setLoginResult] = useState<any>(null)

  const testAdminLogin = async () => {
    setIsLoading(true)
    setMessage('')
    setLoginResult(null)

    try {
      console.log('Probando login de admin...')
      
      // Primero cerrar cualquier sesión existente
      await supabase.auth.signOut()
      
      // Intentar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@hablandodecaballos.com',
        password: 'admin123456',
      })

      if (error) {
        console.error('Error en login:', error)
        setMessage(`❌ Error en login: ${error.message}`)
        setLoginResult({ success: false, error: error.message })
        return
      }

      if (data?.session && data?.user) {
        console.log('Login exitoso:', data.user.email)
        setMessage(`✅ ¡LOGIN EXITOSO!\n\nUsuario: ${data.user.email}\nID: ${data.user.id}\nConfirmado: ${data.user.email_confirmed_at ? 'Sí' : 'No'}\n\nPuedes cerrar esta página y usar la aplicación normalmente.`)
        setLoginResult({ 
          success: true, 
          user: data.user,
          session: data.session
        })
      } else {
        setMessage('❌ Login falló - no se recibió sesión')
        setLoginResult({ success: false, error: 'No session received' })
      }
      
    } catch (err: any) {
      console.error('Error inesperado:', err)
      setMessage(`❌ Error inesperado: ${err.message}`)
      setLoginResult({ success: false, error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const testModeratorLogin = async () => {
    setIsLoading(true)
    setMessage('')
    setLoginResult(null)

    try {
      console.log('Probando login de moderador...')
      
      // Primero cerrar cualquier sesión existente
      await supabase.auth.signOut()
      
      // Intentar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'moderator@hablandodecaballos.com',
        password: 'moderator123456',
      })

      if (error) {
        console.error('Error en login:', error)
        setMessage(`❌ Error en login: ${error.message}`)
        setLoginResult({ success: false, error: error.message })
        return
      }

      if (data?.session && data?.user) {
        console.log('Login exitoso:', data.user.email)
        setMessage(`✅ ¡LOGIN EXITOSO!\n\nUsuario: ${data.user.email}\nID: ${data.user.id}\nConfirmado: ${data.user.email_confirmed_at ? 'Sí' : 'No'}\n\nPuedes cerrar esta página y usar la aplicación normalmente.`)
        setLoginResult({ 
          success: true, 
          user: data.user,
          session: data.session
        })
      } else {
        setMessage('❌ Login falló - no se recibió sesión')
        setLoginResult({ success: false, error: 'No session received' })
      }
      
    } catch (err: any) {
      console.error('Error inesperado:', err)
      setMessage(`❌ Error inesperado: ${err.message}`)
      setLoginResult({ success: false, error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setMessage('')
    setLoginResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#4B2E2E] mb-2">Verificador de Login</h1>
          <p className="text-gray-600">Prueba las credenciales de administrador para confirmar que funcionan</p>
        </div>

        <Card className="w-full">
          <CardContent className="p-6 space-y-6">
            
            {/* Current user info */}
            {user && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Usuario actual logueado: <strong>{user.email}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Message display */}
            {message && (
              <Alert variant={loginResult?.success ? "default" : "destructive"}>
                {loginResult?.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="whitespace-pre-wrap">
                  {message}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Action buttons */}
            <div className="space-y-4">
              <Button
                onClick={testAdminLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Probando Login...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Probar Login Administrador
                  </>
                )}
              </Button>

              <Button
                onClick={testModeratorLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-3 text-base"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Probando Login...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-5 w-5" />
                    Probar Login Moderador
                  </>
                )}
              </Button>

              {user && (
                <Button
                  onClick={logout}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  Cerrar Sesión Actual
                </Button>
              )}
            </div>

            {/* Success actions */}
            {loginResult?.success && (
              <div className="text-center pt-4 space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium mb-2">¡Login Funcionando Correctamente!</p>
                  <p className="text-sm text-green-700">Las credenciales están funcionando perfectamente</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/auth/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Ir a Login Normal
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Ir al Admin Panel
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>¿Qué hace esta página?</strong><br/>
                Prueba directamente las credenciales para confirmar que el login funciona. 
                Si funciona aquí, entonces el problema podría estar en la página de login normal.
              </p>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">Esta es una página de diagnóstico temporal</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
