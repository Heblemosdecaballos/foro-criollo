export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Hablando de Caballos</h1>
        <p>Prueba: debería poder escribir aquí abajo.</p>
        <input className="border rounded p-2 w-full" placeholder="Escriba aquí..." />
        <p><a className="underline" href="/login">Ir a Ingresar</a></p>
      </div>
    </main>
  );
}
