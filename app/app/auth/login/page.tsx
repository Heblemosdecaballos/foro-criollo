
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md horse-shadow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <p className="text-muted-foreground">
            Accede a tu cuenta de Hablando de Caballos
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link 
              href="/auth/register" 
              className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
            >
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
