'use client'

import { useState, useTransition } from 'react'
import { createStoryCommentAction } from './actions'

export default function CommentForm({ storyId }: { storyId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => {
        setError(null)
        startTransition(async () => {
          const res = await createStoryCommentAction(storyId, fd)
          if (!res.ok) setError(res.error || 'No se pudo comentar')
        })
      }}
      className="space-y-3"
    >
      <textarea name="content" placeholder="Escribe un comentario…" className="w-full border rounded px-3 py-2 min-h-[120px]" />
      <button className="px-4 py-2 rounded bg-green-700 text-white" disabled={isPending}>
        {isPending ? 'Publicando…' : 'Comentar'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
