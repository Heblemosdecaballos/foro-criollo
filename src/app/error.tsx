'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: '3rem 1.25rem' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '1rem' }}>
        Se produjo un error 😬
      </h1>
      <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>
        {error?.message || 'Error desconocido'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 6,
          background: '#111827',
          color: '#fff',
        }}
      >
        Reintentar
      </button>
    </main>
  );
}
