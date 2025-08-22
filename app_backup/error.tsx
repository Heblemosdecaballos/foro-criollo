'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ padding: 24 }}>
        <h1>Se produjo un error 😬</h1>
        <p style={{ color: '#a00' }}>{error.message}</p>
        {error.digest && <p>Digest: {error.digest}</p>}
        <button onClick={() => reset()} style={{ marginTop: 12 }}>
          Reintentar
        </button>
      </body>
    </html>
  )
}
