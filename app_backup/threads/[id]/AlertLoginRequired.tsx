// app/threads/[id]/AlertLoginRequired.tsx
"use client";
import { useRouter } from "next/navigation";

export default function AlertLoginRequired() {
  const router = useRouter();
  const go = (to: "login" | "signup") => {
    const url = typeof window !== "undefined" ? window.location.href : "/";
    router.push(`/${to}?redirect=${encodeURIComponent(url)}`);
  };
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm">
          <strong>Necesitas iniciar sesión</strong> para publicar. Tu texto se conservará al iniciar sesión.
        </p>
        <div className="flex gap-2">
          <button onClick={() => go("login")} className="rounded bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700 text-sm">Iniciar sesión</button>
          <button onClick={() => go("signup")} className="rounded border border-amber-600 px-3 py-1.5 text-amber-700 hover:bg-amber-100 text-sm">Crear cuenta</button>
        </div>
      </div>
    </div>
  );
}
