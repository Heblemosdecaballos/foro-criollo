// app/hall/[slug]/AddMediaForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { addMediaAction } from './actions'

export default function AddMediaForm({ profileId, slug }: { profileId: string, slug: string }) {
  const [pending, startTransition] = useTransition()
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
        startTransition(async () => {
          const res = await addMediaAction(fd)
          if (!res.ok) setError(res.error || 'No se pudo subir')
          else (e.currentTarget as HTMLFormElement).reset()
        })
      }}
    >
      <input type="file" name="file" accept="image/*" required />
      <input type="text" name="caption" placeholder="Leyenda (opcional)" className="input" />
      <button className="btn btn-secondary" disabled={pending}>
        {pending ? 'Subiendo…' : 'Subir foto'}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </form>
  )
}
