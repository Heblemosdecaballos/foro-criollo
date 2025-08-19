// utils/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function createSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, {
            ...options,
            // Fuerza atributos seguros para prod
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            // Si usas apex (sin www) y rediriges www -> apex, no pongas domain.
            // Si quieres compartir con subdominios explícitamente:
            // domain: '.hablandodecaballos.com',
          });
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', {
            ...options,
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
          });
        },
      },
    }
  );
}
