import NewHallForm from "./NewHallForm";

export const dynamic = "force-dynamic";
export default function NewHorsePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl md:text-3xl mb-4">Nuevo Ejemplar</h1>
      <NewHallForm />
    </div>
  );
}
