"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

type Mode = "login" | "signup";

export default function EmailAuthForm({ defaultMode = "login" as Mode }) {
  const params = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const supa = createSupabaseBrowserClient();

  useEffect(() => {
    if (params.get("signup") === "1") setMode("signup");
  }, [params]);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supa.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) return alert(error.message);
    router.push("/");
  };

  const signUp = async () => {
    setLoading(true);
    const { error, data } = await supa.auth.signUp({
      email,
      password: pass,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    setLoading(false);
    if (error) return alert(error.message);
    // Si tienes "Confirm email" activado en Supabase, no habrá sesión inmediata:
    if (!data.session) {
      alert("Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.");
      router.push("/");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm">
        <button type="button" onClick={() => setMode("login")}
          className={`px-2 py-1 rounded ${mode === "login" ? "bg-gray-200" : ""}`}>
          Iniciar sesión
        </button>
        <button type="button" onClick={() => setMode("signup")}
          className={`px-2 py-1 rounded ${mode === "signup" ? "bg-gray-200" : ""}`}>
          Crear cuenta
        </button>
      </div>

      <input className="w-full border rounded px-3 py-2" placeholder="Correo" type="email"
        value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Contraseña" type="password"
        value={pass} onChange={(e) => setPass(e.target.value)} required />

      <button
        onClick={mode === "login" ? signIn : signUp}
        disabled={loading}
        className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>
    </div>
  );
}
