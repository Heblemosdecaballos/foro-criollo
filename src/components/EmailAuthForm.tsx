"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function EmailAuthForm() {
  const supa = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supa.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) return alert(error.message);
    window.location.href = "/";
  };

  const signUp = async () => {
    setLoading(true);
    const { error } = await supa.auth.signUp({ email, password: pass });
    setLoading(false);
    if (error) return alert(error.message);
    alert("Cuenta creada. Inicia sesión con tu correo y contraseña.");
  };

  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Contraseña"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        type="password"
      />
      <div className="flex gap-2">
        <button onClick={signIn} disabled={loading}
          className="px-3 py-2 rounded-md bg-secondary">
          Ingresar
        </button>
        <button onClick={signUp} disabled={loading}
          className="px-3 py-2 rounded-md bg-muted">
          Registrarse
        </button>
      </div>
    </div>
  );
}
