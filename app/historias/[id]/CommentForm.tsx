// app/historias/[id]/CommentForm.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

function supaClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

export default function CommentForm({ storyId }: { storyId: string }) {
  const supabase = supaClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  async function submit() {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text })
    });
    setSubmitting(false);
    if (!res.ok) { alert("Error al comentar"); return; }
    setText("");
    router.refresh(); // recarga la lista server-side
  }

  return (
    <div className="space-y-2">
      {!user && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 text-amber-900 text-sm">
          Inicia sesión para comentar.
        </div>
      )}
      <textarea
        className="w-full rounded border p-2 min-h-24 disabled:opacity-60"
        placeholder={user ? "Escribe tu comentario…" : "Inicia sesión para comentar"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!user || submitting}
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={!user || submitting || !text.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Enviando…" : "Comentar"}
        </button>
      </div>
    </div>
  );
}
