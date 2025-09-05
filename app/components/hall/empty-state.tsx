
'use client'

import { useSupabase } from '@/components/providers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Plus } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  andarName: string
}

export function EmptyState({ andarName }: EmptyStateProps) {
  const { user } = useSupabase()

  return (
    <Card className="horse-shadow">
      <CardContent className="text-center py-12">
        <Trophy className="mx-auto h-16 w-16 text-amber-600 mb-4" />
        <h3 className="text-2xl font-bold mb-4">
          No hay ejemplares de {andarName} aún
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Sé el primero en compartir un ejemplar excepcional de {andarName.toLowerCase()} 
          en nuestro Hall of Fame.
        </p>
        
        {/* Debug info - temporal */}
        {user && (
          <div className="mb-4 p-2 bg-green-100 rounded text-sm text-green-800">
            ✅ Sesión detectada: {user.email}
          </div>
        )}
        
        {user ? (
          <Link href="/hall/nueva">
            <Button className="btn-equestrian">
              <Plus className="mr-2 h-4 w-4" />
              Agregar primer ejemplar
            </Button>
          </Link>
        ) : (
          <div className="space-y-3">
            <div className="p-2 bg-yellow-100 rounded text-sm text-yellow-800">
              ⚠️ No se detectó sesión. Revisa el login.
            </div>
            <Link href="/auth/login">
              <Button className="btn-equestrian">
                <Plus className="mr-2 h-4 w-4" />
                Inicia sesión para agregar ejemplares
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
