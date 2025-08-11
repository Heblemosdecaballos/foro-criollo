import SessionButton from '@/components/SessionButton';

export default function Page() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hablando de Caballos</h1>
        <SessionButton />
      </header>

      <p className="text-neutral-700">Bienvenido. Ya puedes ingresar y crear temas.</p>
    </main>
  );
}
