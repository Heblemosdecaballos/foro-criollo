
'use client'

import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export function HallMainActions() {
  const { user } = useSupabase()

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {(user?.email === 'admin@hablandodecaballos.com') && (
        <Link href="/hall/nueva">
          <Button size="lg" className="btn-equestrian">
            <Plus className="mr-2 h-5 w-5" />
            Agregar ejemplar
          </Button>
        </Link>
      )}
      <Link href="/forums">
        <Button size="lg" variant="outline" className="btn-equestrian-outline">
          <MessageSquare className="mr-2 h-5 w-5" />
          Únete a la discusión
        </Button>
      </Link>
    </div>
  )
}
