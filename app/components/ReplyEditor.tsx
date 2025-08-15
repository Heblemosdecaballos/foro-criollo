"use client";
import { useEffect, useState } from "react";
import AlertLoginRequired from "@/components/AlertLoginRequired";
import { createClient } from "@/utils/supabase/client";

export default function ReplyEditor({ threadId }: { threadId: string }) {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const disabled = !user || submitting;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setShowLoginNotice(!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setShowLoginNotice(!session?.user);
    });
    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, []);

  async function handleSubmit() {
    if (!user) { setShowLoginNotice(true); return; }
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });
      const json = await res.json();
      if (res.ok && !json.error) setBody("");
      else alert(json.error ?? "Error al publicar");
    } catch { alert("Error al publicar"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-3">
      {showLoginNotice && <AlertLoginRequired />}
      <textarea
        className="w-full rounded border p-2 min-h-28 disabled:opacity-60"
        placeholder={user ? "Escribe tu respuesta…" : "Inicia sesión para responder"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled}
      />
      <div className="flex items-center justify-between text-xs text-neutral-500">
        {!user ? <span>El editor está bloqueado hasta iniciar sesión.</span> : <span>Publicar como: {user?.email}</span>}
        <button
          onClick={handleSubmit}
          disabled={disabled || !body.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </div>
  );
}
