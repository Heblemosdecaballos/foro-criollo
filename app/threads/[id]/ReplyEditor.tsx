"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import AlertLoginRequired from "../../../components/AlertLoginRequired";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

export default function ReplyEditor({ threadId }: { threadId: string }) {
  const sb = supa();
  const [user, setUser] = useState<any>(null);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, [sb]);

  if (!user) {
    return <AlertLoginRequired redirect={`/threads/${threadId}`} />;
  }

  async function submit() {
    if (!body.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/threads/${threadId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "No se pudo publicar");
      return;
    }
    setBody("");
    // opcional: recargar o usar mutate SWR
    location.reload();
  }

  return (
    <div className="space-y-2">
      <textarea
        className="h-28 w-full rounded border p-2"
        placeholder="Escribe tu respuesta…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={saving || !body.trim()}
          className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </div>
  );
}
