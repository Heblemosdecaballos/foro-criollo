
'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { HorseVoting } from './horse-voting'
import { HorseComments } from './horse-comments'

interface HorseDetailClientProps {
  horseId: string
  createdBy: string
  editUrl: string
}

export function HorseDetailClient({ horseId, createdBy, editUrl }: HorseDetailClientProps) {
  const { user, supabase, isLoading: isAuthLoading } = useSupabase()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything until mounted and auth loaded
  if (!isMounted || isAuthLoading) {
    return null
  }

  // Only show edit button if user owns the horse
  const canEdit = user && user.email && createdBy === user.id
  const isAdmin = user?.email === 'admin@hablandodecaballos.com'

  if (canEdit || isAdmin) {
    return (
      <Link href={editUrl}>
        <Button variant="outline">
          Editar
        </Button>
      </Link>
    )
  }

  return null
}

// Sub-components for different client functionalities
HorseDetailClient.Voting = function VotingWrapper({ 
  horseId, 
  totalVotes, 
  averageRating 
}: { 
  horseId: string
  totalVotes: number
  averageRating: number
}) {
  const { data: session, status } = useSession()
  const [userVote, setUserVote] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    
    // Fetch user's vote if logged in
    if (session?.user) {
      fetchUserVote()
    } else {
      setIsLoading(false)
    }
  }, [session, horseId])

  const fetchUserVote = async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch(`/api/horses/${horseId}`)
      if (response.ok) {
        const { data: horse } = await response.json()
        setUserVote(horse.user_vote || null)
      }
    } catch (error) {
      console.error('Error fetching user vote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted || status === 'loading' || isLoading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <HorseVoting 
      horseId={horseId}
      currentVote={userVote}
      totalVotes={totalVotes}
      averageRating={averageRating}
    />
  )
}

HorseDetailClient.Comments = function CommentsWrapper({ horseId }: { horseId: string }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return <HorseComments horseId={horseId} />
}
