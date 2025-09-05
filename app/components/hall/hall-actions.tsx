
'use client'

import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Plus, Trophy } from 'lucide-react'
import Link from 'next/link'

interface HallActionsProps {
  andarName: string
}

export function HallActions({ andarName }: HallActionsProps) {
  const { user } = useSupabase()

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {user ? (
        <Link href="/hall/nueva">
          <Button size="lg" className="btn-equestrian">
            <Plus className="mr-2 h-5 w-5" />
            Agregar ejemplar
          </Button>
        </Link>
      ) : (
        <Link href="/auth/login">
          <Button size="lg" className="btn-equestrian">
            <Plus className="mr-2 h-5 w-5" />
            Inicia sesión para agregar
          </Button>
        </Link>
      )}
      <Link href="/hall">
        <Button size="lg" variant="outline" className="btn-equestrian-outline">
          <Trophy className="mr-2 h-5 w-5" />
          Ver todos los andares
        </Button>
      </Link>
    </div>
  )
}
