'use client'

import { useState, useTransition } from 'react'
import { toggleVote } from './actions'

export default function VoteButton({
  profileId,
  initialCount,
  initialVoted,
}: {
  profileId: string
  initialCount: number
  initialVoted: boolean
}) {
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(initialVoted)
  const [isPending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-2">
      <button
        className={`btn ${voted ? 'btn-secondary' : 'btn-ghost'}`}
        disabled={isPending}
        onClick={() => {
          setErr(null)
          startTransition(async () => {
            const res = await toggleVote(profileId)
            if (!res.ok) setErr(res.error || 'Error')
            else { setVoted(res.voted); setCount(res.count) }
          })
        }}
      >
        {voted ? 'Quitar voto' : 'Votar'}
      </button>
      <span className="text-sm text-muted">{count} votos</span>
      {err && <span className="text-red-700 text-sm">{err}</span>}
    </div>
  )
}
