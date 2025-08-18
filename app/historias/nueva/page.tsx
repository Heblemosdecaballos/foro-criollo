// app/historias/nueva/page.tsx
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

export default async function NuevaHistoriaPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name, options) =>
          cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario, redirige a login o muéstrale un botón
    redirect('/login?next=/historias/nueva');
  }

  return (
    <main className="container-page py-8">
      <h1 className="text-2xl font-semibold mb-6">Nueva historia</h1>
      {/* Renderiza aquí tu formulario de publicación */}
      {/* ... */}
    </main>
  );
}
