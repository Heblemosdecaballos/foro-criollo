// src/app/login/page.tsx
import Button from "@/src/components/ui/Button";
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="container py-12">
      <h1 className="font-serif text-2xl text-center">Iniciar Sesión</h1>
      <p className="text-center text-brown-700/80">Accede a tu cuenta</p>

      <form className="max-w-md mx-auto mt-6 space-y-3">
        <div>
          <label className="block text-sm mb-1">Usuario</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-cream-100 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input type="password" className="w-full border rounded-lg px-3 py-2 bg-cream-100 focus:outline-none" />
        </div>
        <Button className="w-full">Iniciar Sesión</Button>
        <p className="text-center text-brown-700/80 text-sm">
          ¿No tienes cuenta? <a href="/registro" className="underline">Crear cuenta</a>
        </p>
      </form>
    </div>
  );
}
