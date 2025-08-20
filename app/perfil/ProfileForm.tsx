'use client'

import { useState, useTransition } from 'react'
import { updateProfileAction } from './actions'

export default function ProfileForm({ profile }: { profile: any }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  return (
    <form
      action={(fd) => {
        setError(null); setOk(false)
        startTransition(async () => {
          const res = await updateProfileAction(fd)
          if (!res.ok) setError(res.error || 'No se pudo guardar')
          else setOk(true)
        })
      }}
      className="space-y-4 max-w-lg"
    >
      <div>
        <label className="block text-sm text-muted mb-1">Correo</label>
        <input
          disabled
          defaultValue={profile?.email ?? ''}
          className="w-full border rounded px-3 py-2 bg-black/5"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Nombre</label>
        <input
          name="full_name"
          defaultValue={profile?.full_name ?? ''}
          className="w-full border rounded px-3 py-2"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Usuario</label>
        <input
          name="username"
          defaultValue={profile?.username ?? ''}
          className="w-full border rounded px-3 py-2"
          placeholder="tu_usuario"
        />
        <p className="text-xs text-muted mt-1">Debe ser único. Se guarda en minúsculas.</p>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Celular</label>
        <input
          name="phone"
          defaultValue={profile?.phone ?? ''}
          className="w-full border rounded px-3 py-2"
          placeholder="+57 300 000 0000"
        />
      </div>

      <button className="btn btn-primary" disabled={isPending}>
        {isPending ? 'Guardando…' : 'Guardar cambios'}
      </button>

      {ok && <p className="text-green-700">Perfil actualizado</p>}
      {error && <p className="text-red-700">{error}</p>}
    </form>
  )
}
