"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams, useRouter } from "next/navigation";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

export default function AuthPage() {
  const sb = supa();
  const sp = useSearchParams();
  const router = useRouter();
  const redirect = sp.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si ya está logueado, redirige
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirect);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const origin = window.location.origin;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    });
    setLoading(false);
    if (error) return alert(error.message);
    setSent(true);
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

      <button
        onClick={signInGoogle}
        className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
      >
        Continuar con Google
      </button>

      <div className="text-center text-sm text-neutral-500">o</div>

      <form onSubmit={sendMagicLink} className="space-y-3">
        <label className="block text-sm">
          Correo electrónico
          <input
            type="email"
            className="mt-1 w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border px-4 py-2 hover:bg-neutral-50 disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Recibir enlace mágico"}
        </button>
        {sent && (
          <p className="text-sm text-emerald-700">
            Revisa tu correo y abre el enlace para terminar el inicio de sesión.
          </p>
        )}
      </form>

      <p className="text-xs text-neutral-500">
        Serás redirigido a: <span className="font-mono">{redirect}</span>
      </p>
    </main>
  );
}
