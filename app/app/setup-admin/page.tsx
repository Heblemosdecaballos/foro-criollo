
'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SetupAdminPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const createAdminUser = async () => {
    setIsLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      console.log('Creando usuario administrador...')
      
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@hablandodecaballos.com',
        password: 'admin123456',
        options: {
          data: {
            name: 'Administrador',
            role: 'admin'
          }
        }
      })

      if (error) {
        console.error('Error creando admin:', error)
        if (error.message.includes('already registered')) {
          setMessage('El usuario admin@hablandodecaballos.com ya existe. Puedes usar la contraseña: admin123456')
          setIsSuccess(true)
        } else {
          setMessage(`Error: ${error.message}`)
        }
        return
      }

      if (data.user) {
        setMessage('¡Usuario administrador creado exitosamente!\n\nCredenciales:\nEmail: admin@hablandodecaballos.com\nContraseña: admin123456\n\n¡Ya puedes iniciar sesión!')
        setIsSuccess(true)
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setMessage('Error inesperado. Intenta de nuevo.')
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
      
      const { data, error } = await supabase.auth.signUp({
        email: 'moderator@hablandodecaballos.com',
        password: 'moderator123456',
        options: {
          data: {
            name: 'Moderador',
            role: 'moderator'
          }
        }
      })

      if (error) {
        console.error('Error creando moderador:', error)
        if (error.message.includes('already registered')) {
          setMessage('El usuario moderator@hablandodecaballos.com ya existe. Puedes usar la contraseña: moderator123456')
          setIsSuccess(true)
        } else {
          setMessage(`Error: ${error.message}`)
        }
        return
      }

      if (data.user) {
        setMessage('¡Usuario moderador creado exitosamente!\n\nCredenciales:\nEmail: moderator@hablandodecaballos.com\nContraseña: moderator123456\n\n¡Ya puedes iniciar sesión!')
        setIsSuccess(true)
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setMessage('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#4B2E2E]">
            Configuración de Administrador
          </CardTitle>
          <CardDescription>
            Crea las cuentas administrativas para gestionar el sitio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          
          <div className="space-y-4">
            <Button
              onClick={createAdminUser}
              disabled={isLoading}
              className="w-full btn-equestrian"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Usuario Administrador'
              )}
            </Button>

            <Button
              onClick={createModeratorUser}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Usuario Moderador'
              )}
            </Button>
          </div>

          {isSuccess && (
            <div className="text-center pt-4">
              <Button asChild variant="outline">
                <a href="/auth/login">
                  Ir a Iniciar Sesión
                </a>
              </Button>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p><strong>Administrador:</strong> Acceso completo al panel admin</p>
            <p><strong>Moderador:</strong> Acceso limitado para moderación</p>
            <p className="text-xs">Esta página se puede eliminar después de crear los usuarios</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
