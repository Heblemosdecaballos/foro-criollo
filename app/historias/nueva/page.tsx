// app/historias/nueva/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../utils/supabase/server";
import NewStoryForm from "./NewStoryForm";

export const dynamic = "force-dynamic";

export default async function NuevaHistoriaPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?redirect=/historias/nueva");

  return (
    <main className="container-page py-8">
      <h1>Nueva historia</h1>
      <NewStoryForm />
    </main>
  );
}
