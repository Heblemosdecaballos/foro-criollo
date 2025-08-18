// app/login/page.tsx (Server Component)
import GoogleButton from '@/components/auth/GoogleButton';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  // si venías de /historias/nueva, el guard de sesión te manda aquí con ?next=/historias/nueva
  const next = searchParams?.next || '/';

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

      {/* Botón de Google */}
      <GoogleButton next={next} />

      {/* … aquí puedes dejar tus otros métodos (correo/contraseña, magic link, etc.) */}
    </div>
  );
}
