
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Trophy } from 'lucide-react'
import { AddHorseClient } from '@/components/hall/add-horse-client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function AddHorsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <Suspense fallback={
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Card className="horse-shadow">
            <CardContent className="text-center py-12">
              <Trophy className="mx-auto h-16 w-16 text-amber-600 mb-4" />
              <LoadingSpinner className="mx-auto" />
              <p className="text-muted-foreground mt-4">
                Cargando formulario...
              </p>
            </CardContent>
          </Card>
        </div>
      }>
        <AddHorseClient />
      </Suspense>
    </div>
  )
}
