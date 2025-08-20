// app/hall/[slug]/VoteButton.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleVote } from './actions'

export default function VoteButton({
  profileId,
  initialCount,
  initialVoted,
  slug,
}: {
  profileId: string
  initialCount: number
  initialVoted: boolean
  slug?: string
}) {
  const [pending, startTransition] = useTransition()

  const [state, setState] = useOptimistic(
    { count: initialCount, voted: initialVoted },
    (current, action: { type: 'toggle' }) => {
      if (action.type === 'toggle') {
        const voted = !current.voted
        const count = current.count + (voted ? 1 : -1)
        return { voted, count: Math.max(0, count) }
      }
      return current
    }
  )

  return (
    <button
      className={`btn ${state.voted ? 'btn-secondary' : 'btn-ghost'}`}
      disabled={pending}
      onClick={() => {
        setState({ type: 'toggle' })
        startTransition(async () => {
          const res = await toggleVote(profileId, slug)
          if (!res.ok) {
            // revertir si falló
            setState({ type: 'toggle' })
            console.error(res.error)
          }
        })
      }}
      title={state.voted ? 'Quitar voto' : 'Votar'}
    >
      {state.voted ? '✓ Votaste' : 'Votar'} · {state.count}
    </button>
  )
}
