import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import NewThreadForm from "./NewThreadForm";

export default async function NuevoForoPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Crear nuevo foro / hilo</h1>
      {user ? (
        <NewThreadForm />
      ) : (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          Debes iniciar sesión para crear un foro.{" "}
          <Link className="underline" href="/login">Inicia sesión</Link>
        </p>
      )}
    </div>
  );
}
