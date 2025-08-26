// src/app/foros/nuevo/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/src/lib/supabase/server";
import NewThreadForm from "./NewThreadForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CrearForo() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/foros/nuevo");

  return (
    <main className="container py-12">
      <h1 className="font-serif text-2xl text-brown-800">Crear Nuevo Foro</h1>
      <p className="text-brown-700/80 mt-2">
        Comparte un nuevo tema con la comunidad.
      </p>
      <div className="mt-6">
        <NewThreadForm />
      </div>
    </main>
  );
}
