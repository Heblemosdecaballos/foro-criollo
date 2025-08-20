'use client'
import { useState } from 'react'

export default function SignOutButton() {
  const [loading, setLoading] = useState(false)
  return (
    <button
      className="btn btn-ghost"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        try { await fetch('/api/auth/signout', { method: 'POST' }); location.reload() }
        finally { setLoading(false) }
      }}
    >
      {loading ? 'Saliendo…' : 'Salir'}
    </button>
  )
}
