'use client'

export default function HallSlugError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container max-w-3xl py-10 space-y-4">
      <h2 className="text-xl font-semibold">Error en editor del Hall</h2>
      <pre className="rounded-md bg-red-50 p-4 text-red-700 whitespace-pre-wrap text-sm">
        {error?.message || 'Se produjo un error.'}
        {error?.digest ? `\n\nDigest: ${error.digest}` : null}
      </pre>
      <button className="btn btn-primary" onClick={() => reset()}>
        Reintentar
      </button>
    </div>
  )
}
