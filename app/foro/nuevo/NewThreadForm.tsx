'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createThreadAction } from '@/app/foro/nuevo/actions' // <-- import explícito

export default function NewThreadForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => {
        setError(null)
        startTransition(async () => {
          const res = await createThreadAction(fd)
          if (res.ok) router.push(`/foro/${res.id}`)
          else setError(res.error || 'No se pudo crear el hilo')
        })
      }}
      className="space-y-4"
    >
      <input
        name="title"
        placeholder="Título del hilo"
        className="w-full border rounded px-3 py-2"
        required
      />
      <textarea
        name="content"
        placeholder="Mensaje inicial"
        className="w-full min-h-[220px] border rounded px-3 py-2"
      />
      <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white" disabled={isPending}>
        {isPending ? 'Publicando…' : 'Publicar'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
