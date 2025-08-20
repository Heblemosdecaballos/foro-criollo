// app/hall/[slug]/HallCommentForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { addHallComment } from './actions'

export default function HallCommentForm({
  profileId,
  slug,
  viewerName,
}: {
  profileId: string
  slug: string
  viewerName: string | null
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget as HTMLFormElement)
        fd.set('profileId', profileId)
        fd.set('slug', slug)
        setError(null)
        startTransition(async () => {
          const res = await addHallComment(fd)
          if (!res.ok) setError(res.error || 'No se pudo comentar')
          else (e.currentTarget as HTMLFormElement).reset()
        })
      }}
    >
      <textarea
        name="content"
        rows={3}
        className="input w-full"
        placeholder={`Escribe un comentario${viewerName ? `, ${viewerName}` : ''}…`}
        required
      />
      <div className="flex items-center gap-2">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? 'Publicando…' : 'Comentar'}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </form>
  )
}
