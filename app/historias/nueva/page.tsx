// app/historias/nueva/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/utils/supabase/server';
import NewStoryForm from './NewStoryForm'; // tu componente de formulario (cliente)

export const dynamic = 'force-dynamic'; // opcional, si notas issues con caché
export const revalidate = 0;             // opcional

export default async function NuevaHistoriaPage() {
  const supabase = createSupabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Manejo de error si quieres
  }

  if (!user) {
    // Redirige a login y regresa a esta ruta luego
    redirect('/login?next=/historias/nueva');
  }

  return (
    <main className="container-page py-8">
      <h1 className="mb-4 text-2xl font-semibold">Nueva historia</h1>
      <NewStoryForm />
    </main>
  );
}
