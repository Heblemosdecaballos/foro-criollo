"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams, useRouter } from "next/navigation";

function supa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function AuthPage() {
  const sb = supa();
  const sp = useSearchParams();
  const router = useRouter();
  const redirect = sp.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // si ya hay sesión, redirige
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirect);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function afterSessionRedirect() {
    // Forzamos a pasar por /auth/callback/finish para que el servidor ponga la cookie
    const current = await sb.auth.getSession();
    const s = current.data.session;
    if (s?.access_token && s.refresh_token) {
      const url =
        `/auth/callback/finish?` +
        `access_token=${encodeURIComponent(s.access_token)}` +
        `&refresh_token=${encodeURIComponent(s.refresh_token)}` +
        `&redirect=${encodeURIComponent(redirect)}`;
      window.location.assign(url);
    } else {
      router.replace(redirect);
    }
  }

  async function loginWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    await afterSessionRedirect();
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password !== password2) {
      return setMsg("Las contraseñas no coinciden.");
    }
    setLoading(true);
    const { data, error } = await sb.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);

    // Si el proyecto está en "Auto-confirm OFF", ya habrá sesión y redirigimos.
    // Si requiere confirmación por email, informamos.
    if (data.session) {
      await afterSessionRedirect();
    } else {
      setMsg(
        "Cuenta creada. Si tu proyecto requiere confirmación por correo, revisa tu email."
      );
    }
  }

  async function signInGoogle() {
    const origin = window.location.origin;
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(
          redirect
        )}`,
      },
    });
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

      <button
        onClick={signInGoogle}
        className="w-full rounded-md bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
      >
        Continuar con Google
      </button>

      <div className="text-center text-sm text-neutral-500">o</div>

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setMode("login")}
          className={`rounded px-3 py-1.5 border ${
            mode === "login" ? "bg-neutral-100" : "hover:bg-neutral-50"
          }`}
        >
          Entrar con email
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`rounded px-3 py-1.5 border ${
            mode === "signup" ? "bg-neutral-100" : "hover:bg-neutral-50"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {mode === "login" ? (
        <form onSubmit={loginWithPassword} className="space-y-3">
          <label className="block text-sm">
            Correo
            <input
              type="email"
              className="mt-1 w-full rounded border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Contraseña
            <input
              type="password"
              className="mt-1 w-full rounded border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      ) : (
        <form onSubmit={signUp} className="space-y-3">
          <label className="block text-sm">
            Correo
            <input
              type="email"
              className="mt-1 w-full rounded border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Contraseña
            <input
              type="password"
              className="mt-1 w-full rounded border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Repite la contraseña
            <input
              type="password"
              className="mt-1 w-full rounded border p-2"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>
      )}

      {msg && <p className="text-sm text-amber-700">{msg}</p>}

      <p className="text-xs text-neutral-500">
        Serás redirigido a: <span className="font-mono">{redirect}</span>
      </p>
    </main>
  );
}
