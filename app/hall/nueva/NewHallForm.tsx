// app/hall/nueva/NewHallForm.tsx
'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createNomination } from './actions'

export default function NewHallForm() {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget as HTMLFormElement)
        setError(null)
        start(async () => {
          const res = await createNomination(fd)
          if (!res.ok) {
            setError(res.error || 'No se pudo crear la nominación')
            return
          }
          router.push(`/hall/${res.slug}`)
        })
      }}
      encType="multipart/form-data"
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input name="title" className="input w-full" required />
      </div>

      <div>
        <label className="block text-sm font-medium">Andar</label>
        <select name="gait" className="input w-full" required>
          <option value="trocha_galope">Trocha y Galope</option>
          <option value="trote_galope">Trote y Galope</option>
          <option value="trocha_colombia">Trocha Colombia</option>
          <option value="paso_fino">Paso Fino Colombiano</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Año (opcional)</label>
        <input name="year" type="number" className="input w-full" placeholder="Ej. 2018" />
      </div>

      <div>
        <label className="block text-sm font-medium">Biografía</label>
        <textarea name="bio" rows={4} className="input w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Logros (opcional)</label>
        <textarea name="achievements" rows={3} className="input w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Portada (opcional)</label>
        <input type="file" name="cover" accept="image/*" />
      </div>

      <button className="btn btn-primary" disabled={pending}>
        {pending ? 'Creando…' : 'Crear nominación'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  )
}
