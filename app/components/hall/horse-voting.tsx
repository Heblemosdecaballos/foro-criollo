
'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface HorseVotingProps {
  horseId: string
  currentVote: number | null
  totalVotes: number
  averageRating: number
}

export function HorseVoting({ 
  horseId, 
  currentVote, 
  totalVotes, 
  averageRating 
}: HorseVotingProps) {
  const { user, supabase, isLoading: isAuthLoading } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vote, setVote] = useState(currentVote)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleVote = async (rating: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión para votar')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/horses/${horseId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: rating })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al votar')
      }

      setVote(rating)
      toast.success('¡Voto registrado exitosamente!')
    } catch (error) {
      console.error('Error voting:', error)
      toast.error(error instanceof Error ? error.message : 'Error al votar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveVote = async () => {
    if (!session?.user || !vote) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/horses/${horseId}/vote`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar voto')
      }

      setVote(null)
      toast.success('Voto eliminado')
    } catch (error) {
      console.error('Error removing vote:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar voto')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isMounted || status === 'loading') {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-8 w-8 text-gray-300"
            />
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-8 w-8",
                star <= averageRating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        
        <div className="text-center text-muted-foreground mb-4">
          <p className="text-lg font-semibold">
            {averageRating.toFixed(1)} / 5.0
          </p>
          <p className="text-sm">
            Basado en {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
          </p>
        </div>

        <Link href="/auth/login">
          <Button className="w-full btn-equestrian">
            Inicia sesión para votar
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Rating Display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-6 w-6",
                star <= averageRating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} / 5.0 ({totalVotes} {totalVotes === 1 ? 'voto' : 'votos'})
        </p>
      </div>

      {/* User Voting Interface */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-center">
          {vote ? 'Tu calificación:' : 'Califica este ejemplar:'}
        </p>
        
        <div className="flex items-center justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmitting}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => handleVote(star)}
              className={cn(
                "h-10 w-10 transition-all duration-200 disabled:opacity-50",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
              )}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoveredStar >= star || (!hoveredStar && vote && vote >= star))
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300 hover:text-amber-200"
                )}
              />
            </button>
          ))}
        </div>

        {vote && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Has calificado este ejemplar con {vote} {vote === 1 ? 'estrella' : 'estrellas'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveVote}
              disabled={isSubmitting}
              className="text-sm"
            >
              Eliminar mi voto
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
