import NewStoryForm from "./NewStoryForm";

export default function NuevaHistoriaPage() {
  return (
    <main className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Nueva historia</h1>
      <NewStoryForm />
    </main>
  );
}
