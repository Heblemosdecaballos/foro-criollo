// app/login/page.tsx
import GoogleButton from '@/components/auth/GoogleButton'

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams?.next ?? '/'
  return (
    <main className="container-page py-8">
      <h1>Iniciar sesión</h1>
      <GoogleButton next={next} />
      {/* Si tienes login por correo/contraseña, colócalo aquí también */}
    </main>
  )
}
