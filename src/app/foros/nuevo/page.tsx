import NewThreadForm from "./NewThreadForm";

export default function NuevoForoPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Crear nuevo foro / hilo</h1>
      <NewThreadForm />
    </div>
  );
}
