'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createNomination } from './actions'

export default function NewHallForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) => {
        setError(null)
        startTransition(async () => {
          const res = await createNomination(fd)
          if (res.ok) router.push(`/hall/${res.slug}`)
          else setError(res.error || 'No se pudo crear la nominación')
        })
      }}
      className="space-y-4 max-w-2xl"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1">Nombre del caballo</label>
          <input name="title" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Andar</label>
          <select name="gait" className="w-full border rounded px-3 py-2">
            <option value="trocha_galope">Trocha y Galope</option>
            <option value="trote_galope">Trote y Galope</option>
            <option value="trocha_colombia">Trocha Colombia</option>
            <option value="paso_fino">Paso Fino Colombiano</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Año (referencia)</label>
          <input name="year" type="number" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Imagen principal (URL)</label>
          <input name="image_url" className="w-full border rounded px-3 py-2" placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Biografía / descripción</label>
        <textarea name="bio" className="w-full min-h-[160px] border rounded px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Logros destacados</label>
        <textarea name="achievements" className="w-full min-h-[120px] border rounded px-3 py-2" />
      </div>

      <button className="btn btn-primary" disabled={isPending}>
        {isPending ? 'Guardando…' : 'Guardar nominación'}
      </button>

      {error && <p className="text-red-700">{error}</p>}
    </form>
  )
}
