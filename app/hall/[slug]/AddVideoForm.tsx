// app/hall/[slug]/AddVideoForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { addYoutubeAction } from './actions'

export default function AddVideoForm({ profileId, slug }: { profileId: string; slug: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget as HTMLFormElement)
        fd.set('profileId', profileId)
        fd.set('slug', slug)
        setError(null)
        start(async () => {
          const res = await addYoutubeAction(fd)
          if (!res.ok) setError(res.error || 'No se pudo agregar el video')
          else (e.currentTarget as HTMLFormElement).reset()
        })
      }}
    >
      <input name="url" className="input w-72" placeholder="URL de YouTube" required />
      <button className="btn btn-secondary" disabled={pending}>
        {pending ? 'Agregando…' : 'Agregar video'}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </form>
  )
}
