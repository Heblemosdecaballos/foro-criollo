
'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, User, Database } from 'lucide-react'

export default function DiagnosticoAuthPage() {
  const { supabase, user } = useSupabase()
  const [diagnostico, setDiagnostico] = useState('')

  const ejecutarDiagnostico = async () => {
    let resultado = '=== DIAGNÓSTICO BÁSICO DE AUTENTICACIÓN ===\n\n'
    
    try {
      // 1. Estado del cliente
      resultado += `1. USUARIO DEL CLIENTE:\n`
      resultado += user ? `✅ Logueado: ${user.email}\n` : `❌ No hay usuario\n`
      resultado += `\n`

      // 2. Session de Supabase
      const { data: sessionData } = await supabase.auth.getSession()
      resultado += `2. SESIÓN DE SUPABASE:\n`
      resultado += sessionData.session ? `✅ Sesión activa: ${sessionData.session.user.email}\n` : `❌ No hay sesión\n`
      resultado += `\n`

      // 3. Test básico
      resultado += `3. DIAGNÓSTICO:\n`
      if (user && sessionData.session) {
        resultado += `✅ Sistema funcionando correctamente\n`
      } else {
        resultado += `❌ Hay un problema con la autenticación\n`
      }

      setDiagnostico(resultado)
      
    } catch (error: any) {
      setDiagnostico(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#4B2E2E] mb-2">Diagnóstico Simplificado</h1>
          <p className="text-gray-600">Verificación básica del sistema de autenticación</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Estado Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={user ? "default" : "destructive"}>
              {user ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <strong>Usuario:</strong> {user ? `✅ ${user.email}` : '❌ No detectado'}
              </AlertDescription>
            </Alert>

            <Button
              onClick={ejecutarDiagnostico}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Database className="mr-2 h-4 w-4" />
              Ejecutar Diagnóstico
            </Button>

            {diagnostico && (
              <Card>
                <CardContent className="pt-6">
                  <pre className="text-sm whitespace-pre-wrap">{diagnostico}</pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
