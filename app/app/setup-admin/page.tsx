
'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, User, Shield } from 'lucide-react'
import Link from 'next/link'

export default function SetupAdminPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)

  // Función alternativa usando signup directo
  const createUserDirect = async (email: string, password: string, name: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            email_confirm: true
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return {
            success: true,
            message: `✅ El usuario ${email} YA EXISTE y está listo para usar.\n\nPuedes hacer login ahora con:\nEmail: ${email}\nContraseña: ${password}`
          }
        }
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        message: `¡Usuario ${role} creado exitosamente!\n\nCredenciales:\nEmail: ${email}\nContraseña: ${password}\n\n¡Ya puedes iniciar sesión!` 
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const createAdminUser = async () => {
    setIsLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      console.log('Creando usuario administrador...')
      
      // Primero intentar con la API
      try {
        const response = await fetch('/api/create-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'admin@hablandodecaballos.com',
            password: 'admin123456',
            name: 'Administrador',
            role: 'admin'
          })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setMessage('¡Usuario administrador creado exitosamente con API!\n\nCredenciales:\nEmail: admin@hablandodecaballos.com\nContraseña: admin123456\n\n¡Ya puedes iniciar sesión!')
            setIsSuccess(true)
            return
          }
          
          if (result.error && (result.error.includes('already registered') || result.error.includes('User already registered'))) {
            setMessage('✅ ¡PERFECTO! El usuario admin@hablandodecaballos.com YA EXISTE.\n\n🔑 Credenciales listas para usar:\nEmail: admin@hablandodecaballos.com\nContraseña: admin123456\n\n👉 ¡Ya puedes hacer login!')
            setIsSuccess(true)
            return
          }
        }
      } catch (apiError) {
        console.log('API no disponible, intentando método alternativo...')
        setApiAvailable(false)
      }

      // Si la API falla, usar signup directo
      const result = await createUserDirect('admin@hablandodecaballos.com', 'admin123456', 'Administrador', 'Administrador')
      
      if (result.success) {
        setMessage(result.message || '¡Usuario administrador creado!')
        setIsSuccess(true)
      } else {
        setMessage(`Error: ${result.error}`)
      }
      
    } catch (err: any) {
      console.error('Error inesperado:', err)
      setMessage(`Error inesperado: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createModeratorUser = async () => {
    setIsLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      console.log('Creando usuario moderador...')
      
      // Primero intentar con la API
      try {
        const response = await fetch('/api/create-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'moderator@hablandodecaballos.com',
            password: 'moderator123456',
            name: 'Moderador',
            role: 'moderator'
          })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setMessage('¡Usuario moderador creado exitosamente con API!\n\nCredenciales:\nEmail: moderator@hablandodecaballos.com\nContraseña: moderator123456\n\n¡Ya puedes iniciar sesión!')
            setIsSuccess(true)
            return
          }
          
          if (result.error && (result.error.includes('already registered') || result.error.includes('User already registered'))) {
            setMessage('✅ ¡PERFECTO! El usuario moderator@hablandodecaballos.com YA EXISTE.\n\n🔑 Credenciales listas para usar:\nEmail: moderator@hablandodecaballos.com\nContraseña: moderator123456\n\n👉 ¡Ya puedes hacer login!')
            setIsSuccess(true)
            return
          }
        }
      } catch (apiError) {
        console.log('API no disponible, intentando método alternativo...')
        setApiAvailable(false)
      }

      // Si la API falla, usar signup directo
      const result = await createUserDirect('moderator@hablandodecaballos.com', 'moderator123456', 'Moderador', 'Moderador')
      
      if (result.success) {
        setMessage(result.message || '¡Usuario moderador creado!')
        setIsSuccess(true)
      } else {
        setMessage(`Error: ${result.error}`)
      }
      
    } catch (err: any) {
      console.error('Error inesperado:', err)
      setMessage(`Error inesperado: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#4B2E2E] mb-2">Configuración Inicial</h1>
          <p className="text-gray-600">Crea las cuentas administrativas para gestionar "Hablando de Caballos"</p>
        </div>

        <Card className="w-full">
          <CardContent className="p-6 space-y-6">
            {/* Status indicator */}
            {!apiAvailable && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Usando método alternativo de creación (signup directo)
                </AlertDescription>
              </Alert>
            )}

            {/* Message display */}
            {message && (
              <Alert variant={isSuccess ? "default" : "destructive"}>
                {isSuccess ? (
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
                onClick={createAdminUser}
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-base font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creando Usuario...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Crear Usuario Administrador
                  </>
                )}
              </Button>

              <Button
                onClick={createModeratorUser}
                disabled={isLoading}
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 py-3 text-base"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creando Usuario...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Crear Usuario Moderador
                  </>
                )}
              </Button>
            </div>

            {/* Success actions */}
            {isSuccess && (
              <div className="text-center pt-4 space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium mb-2">¡Configuración Completada!</p>
                  <p className="text-sm text-green-700">Ya puedes cerrar esta página y hacer login</p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Ir a Iniciar Sesión →
                  </Button>
                </Link>
              </div>
            )}

            {/* Info cards */}
            <div className="grid gap-4 pt-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 mb-1">Administrador</p>
                    <p className="text-sm text-amber-700 mb-2">Acceso completo al panel admin, gestión de usuarios, configuración del sitio</p>
                    <p className="text-xs text-amber-600 font-mono">admin@hablandodecaballos.com</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 mb-1">Moderador</p>
                    <p className="text-sm text-blue-700 mb-2">Acceso limitado para moderación de contenido y usuarios</p>
                    <p className="text-xs text-blue-600 font-mono">moderator@hablandodecaballos.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">Esta página se puede eliminar después de crear los usuarios</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
