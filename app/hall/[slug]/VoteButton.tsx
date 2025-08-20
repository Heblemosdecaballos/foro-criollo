'use client'

import { useState, useTransition } from 'react'
import { toggleVote } from './actions'

type Props = {
  profileId: string
  slug: string
  initialVoted: boolean
  initialCount: number
}

export default function VoteButton({
  profileId,
  slug,
  initialVoted,
  initialCount,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [voted, setVoted] = useState(initialVoted)
  const [count, setCount] = useState(initialCount)

  const handleClick = () => {
    const prevVoted = voted
    const prevCount = count

    // Optimista
    setVoted(!prevVoted)
    setCount(prevVoted ? prevCount - 1 : prevCount + 1)

    startTransition(async () => {
      const fd = new FormData()
      fd.set('profileId', profileId)
      fd.set('slug', slug)

      const res = await toggleVote(fd)

      if (!res?.ok) {
        // revertir si falló
        setVoted(prevVoted)
        setCount(prevCount)
        return
      }
      // opcional: sincronizar con lo que devuelva el server
      if (typeof res.voted === 'boolean') setVoted(res.voted)
      if (typeof res.count === 'number') setCount(res.count)
    })
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={voted}
    >
      {voted ? 'Quitar voto' : 'Votar'} ({count})
    </button>
  )
}
