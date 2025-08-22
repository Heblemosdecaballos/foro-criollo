import NewThreadButton from "./components/NewThreadButton";

export default async function ForoPage() {
  // aquí podrías cargar los hilos existentes…
  const threads: any[] = [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Foro</h1>
        <NewThreadButton />
      </div>

      {threads.length === 0 ? (
        <p className="text-neutral-600">Aún no hay foros publicados.</p>
      ) : (
        <ul className="space-y-3">
          {/* render de hilos */}
        </ul>
      )}
    </div>
  );
}
