'use client'

import { useState, useTransition } from 'react'
import { uploadMedia } from './actions'

export default function AddMediaForm({ profileId }: { profileId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) => {
        setError(null)
        startTransition(async () => {
          fd.set('profile_id', profileId)
          const res = await uploadMedia(fd)
          if (!res.ok) setError(res.error || 'No se pudo subir la foto')
        })
      }}
      className="flex items-center gap-2"
    >
      <input name="file" type="file" accept="image/*" required className="max-w-[240px]" />
      <input name="caption" placeholder="Leyenda (opcional)" className="border rounded px-2 py-1" />
      <button className="btn btn-secondary" disabled={isPending}>
        {isPending ? 'Subiendo…' : 'Subir foto'}
      </button>
      {error && <span className="text-red-700 text-sm">{error}</span>}
    </form>
  )
}
