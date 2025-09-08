
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
          Los ejemplares de {andarName.toLowerCase()} serán agregados por el administrador.
        </p>
        
        {user?.email === 'admin@hablandodecaballos.com' ? (
          <Link href="/hall/nueva">
            <Button className="btn-equestrian">
              <Plus className="mr-2 h-4 w-4" />
              Agregar primer ejemplar
            </Button>
          </Link>
        ) : (
          <div className="text-sm text-gray-600">
            Solo el administrador puede agregar ejemplares al Hall de la Fama.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
