'use client'

import { useState } from 'react'

export default function SignOutButton() {
  const [loading, setLoading] = useState(false)

  return (
    <button
      className="rounded px-3 py-2 border"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        try {
          await fetch('/api/auth/signout', { method: 'POST' })
          window.location.reload()
        } finally {
          setLoading(false)
        }
      }}
    >
      {loading ? 'Saliendo…' : 'Salir'}
    </button>
  )
}
