import NewThreadForm from "@/components/NewThreadForm";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewThreadPage() {
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Crear hilo</h1>
        {!user && <a href="/login" className="underline">Inicia sesión</a>}
      </div>
      {user && <NewThreadForm />}
    </main>
  );
}
