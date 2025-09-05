
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { isValidEmail } from '@/lib/utils'

export function LoginForm() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!isValidEmail(formData.email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Intentando iniciar sesión con:', formData.email)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        console.error('Error de login:', signInError)
        if (signInError.message.includes('Invalid login credentials')) {
          setError('❌ Email o contraseña incorrectos.\n\n💡 Verifica:\n• Email: admin@hablandodecaballos.com\n• Contraseña: admin123456\n\n🔧 Si sigues teniendo problemas, ve a /verificar-login')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('❌ Email no confirmado.\n\n💡 El usuario existe pero necesita confirmación de email. Ve a /setup-admin para más información.')
        } else {
          setError(`❌ Error al iniciar sesión: ${signInError.message}\n\n🔧 Si sigues teniendo problemas, ve a /verificar-login`)
        }
        return
      }

      if (data?.session) {
        console.log('Sesión creada exitosamente:', data.session.user.email)
        
        // Guardar en localStorage como respaldo
        if (typeof window !== 'undefined') {
          localStorage.setItem('supabase-session', JSON.stringify(data.session))
        }
        
        // Obtener la URL de redireccionamiento si existe
        const urlParams = new URLSearchParams(window.location.search)
        const redirectUrl = urlParams.get('redirect') || '/'
        
        // Esperar un poco para que la sesión se propague
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 500)
      }
    } catch (err) {
      console.error('Error inesperado en login:', err)
      setError('Error inesperado. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="pl-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full btn-equestrian"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  )
}
