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
  const [note, setNote] = useState<string | null>(null);
  const supa = createSupabaseBrowserClient();

  useEffect(() => {
    if (params.get("signup") === "1") setMode("signup");
  }, [params]);

  const redirectTo = `${window.location.origin}/auth/callback?next=/`;

  const signIn = async () => {
    setLoading(true); setNote(null);
    const { error } = await supa.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) {
      // Mensaje más útil cuando la cuenta no está confirmada
      if (/(email|confirm)/i.test(error.message)) {
        setNote("Tu correo aún no está confirmado. Revisa tu bandeja o reenvía el correo abajo.");
      } else {
        setNote("Credenciales inválidas. Verifica el correo y la contraseña.");
      }
      return;
    }
    router.push("/");
  };

  const signUp = async () => {
    setLoading(true); setNote(null);
    const { error, data } = await supa.auth.signUp({
      email,
      password: pass,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) {
      setNote(error.message || "No se pudo crear la cuenta.");
      return;
    }
    if (!data.session) {
      // Modo "Confirm email" activado: no hay sesión inmediata
      setNote("Te enviamos un correo de confirmación. Revisa tu bandeja o reenvíalo abajo si no llega.");
    } else {
      router.push("/");
    }
  };

  const resendConfirmation = async () => {
    setLoading(true);
    const { error } = await supa.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    } as any);
    setLoading(false);
    if (error) return setNote(error.message || "No pudimos reenviar el correo.");
    setNote("Correo de confirmación reenviado. Revisa tu bandeja (y spam).");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`px-2 py-1 rounded ${mode === "login" ? "bg-gray-200" : ""}`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`px-2 py-1 rounded ${mode === "signup" ? "bg-gray-200" : ""}`}
        >
          Crear cuenta
        </button>
      </div>

      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Correo"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Contraseña"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        required
      />

      <button
        onClick={mode === "login" ? signIn : signUp}
        disabled={loading}
        className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>

      {note && <p className="text-sm text-amber-700">{note}</p>}

      {/* Opción para re-enviar confirmación si no llega */}
      <div className="text-sm">
        ¿No llegó el correo?{" "}
        <button type="button" onClick={resendConfirmation} className="underline">
          Reenviar confirmación
        </button>
      </div>
    </div>
  );
}
