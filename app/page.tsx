export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Foro Criollo — mantenimiento</h1>
        <p className="mb-2">Prueba de campos:</p>
        <input className="border p-2 w-full mb-4" placeholder="Escriba aquí..." />
        <a className="underline" href="/login">Ir a Ingresar</a>
      </div>
    </main>
  );
}
