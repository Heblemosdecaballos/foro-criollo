// app/foro/[id]/CommentForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { addThreadComment } from './actions'

export default function CommentForm({
  threadId,
  viewerName,
}: {
  threadId: string
  viewerName?: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) => {
        setError(null)
        startTransition(async () => {
          fd.set('thread_id', threadId) // id oculto en el submit
          const res = await addThreadComment(fd)
          if (!res.ok) setError(res.error || 'No se pudo comentar')
          // al revalidatePath, la página refresca y aparece el comentario
        })
      }}
      className="space-y-3"
    >
      <div className="text-sm text-muted">
        Comentando como <strong>{viewerName ?? 'Usuario'}</strong>
      </div>

      <textarea
        name="content"
        className="w-full min-h-[150px] border rounded px-3 py-2"
        placeholder="Escribe un comentario…"
        required
      />

      <button type="submit" className="btn btn-secondary" disabled={isPending}>
        {isPending ? 'Enviando…' : 'Comentar'}
      </button>

      {error && <p className="text-red-700">{error}</p>}
    </form>
  )
}
