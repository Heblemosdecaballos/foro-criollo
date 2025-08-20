'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container py-10 space-y-4">
      <h2 className="text-xl font-semibold">Error en el editor</h2>
      <pre className="rounded-md bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
        {error?.message ?? 'Se produjo un error.'}
      </pre>
      <button
        className="btn btn-primary"
        onClick={() => reset()}
      >
        Reintentar
      </button>
    </div>
  );
}
