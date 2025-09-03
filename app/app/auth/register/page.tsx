
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md horse-shadow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <p className="text-muted-foreground">
            Únete a la comunidad ecuestre más grande
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link 
              href="/auth/login" 
              className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
