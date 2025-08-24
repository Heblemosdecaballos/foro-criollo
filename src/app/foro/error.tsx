"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="container py-10 space-y-3">
      <h2 className="text-xl font-semibold">Ocurrió un error cargando el foro</h2>
      <button onClick={() => reset()} className="px-3 py-2 rounded bg-secondary">
        Reintentar
      </button>
    </div>
  );
}
