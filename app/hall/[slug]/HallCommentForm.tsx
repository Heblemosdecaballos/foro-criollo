// app/hall/[slug]/HallCommentForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { addHallComment } from './actions'

type Props = {
  profileId: string
  slug: string
  viewerName: string
}

export default function HallCommentForm({ profileId, slug, viewerName }: Props) {
  const [value, setValue] = useState('')
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return

    const fd = new FormData()
    fd.set('profileId', profileId)
    fd.set('slug', slug)
    fd.set('content', value)

    startTransition(async () => {
      const res = await addHallComment(fd)
      if (res?.ok) {
        setValue('')
      } else {
        // podrías mostrar un toast si quieres
        console.error(res?.error || 'No se pudo guardar')
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        className="w-full rounded-lg border bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2"
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Escribe un comentario, ${viewerName}...`}
        disabled={pending}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={pending || !value.trim()}
      >
        {pending ? 'Guardando…' : 'Comentar'}
      </button>
    </form>
  )
}
