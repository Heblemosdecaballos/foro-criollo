"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addCommentAction } from "./actions";

export default function NewPostForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [value, setValue] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const fd = new FormData(e.currentTarget);
    fd.set("thread_id", threadId);

    startTransition(async () => {
      const res = await addCommentAction(fd);
      if (!res.ok) {
        setErrorMsg(res.message || "No se pudo publicar.");
        return;
      }
      setValue("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        name="content"
        required
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe tu respuesta…"
        className="w-full border rounded p-2"
      />
      {errorMsg && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {errorMsg}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar respuesta"}
      </button>
    </form>
  );
}
