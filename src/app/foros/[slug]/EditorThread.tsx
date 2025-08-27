"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { editThreadAction, deleteThreadAction, reportContentAction } from "./actions";

export default function EditorThread({ thread }: { thread: { id: string; title: string; content: string } }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [content, setContent] = useState(thread.content);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const save = () => {
    const fd = new FormData();
    fd.set("thread_id", thread.id);
    fd.set("title", title);
    fd.set("content", content);
    startTransition(async () => {
      const res = await editThreadAction(fd);
      if (!res.ok) { setMsg(res.message || "Error"); return; }
      setEditing(false);
      router.refresh();
    });
  };

  const softDelete = () => {
    if (!confirm("¿Eliminar este hilo? (soft-delete)")) return;
    const fd = new FormData();
    fd.set("thread_id", thread.id);
    startTransition(async () => {
      const res = await deleteThreadAction(fd);
      if (!res.ok) { setMsg(res.message || "Error"); return; }
      router.push(res.redirectTo || "/foros");
    });
  };

  const report = () => {
    const reason = prompt("Indica el motivo del reporte:");
    if (!reason) return;
    const fd = new FormData();
    fd.set("target_type", "thread");
    fd.set("target_id", thread.id);
    fd.set("reason", reason);
    startTransition(async () => {
      const res = await reportContentAction(fd);
      setMsg(res.ok ? "Reporte enviado." : (res.message || "Error al reportar"));
    });
  };

  if (editing) {
    return (
      <div className="rounded-xl border bg-white p-3 space-y-2">
        <input className="w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full border rounded p-2" rows={6} value={content} onChange={e => setContent(e.target.value)} />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <div className="flex gap-2">
          <button disabled={pending} onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white">{pending ? "Guardando..." : "Guardar"}</button>
          <button disabled={pending} onClick={() => setEditing(false)} className="px-3 py-1 rounded border">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => setEditing(true)} className="px-3 py-1 rounded border">Editar</button>
      <button onClick={softDelete} className="px-3 py-1 rounded border text-red-600">Eliminar</button>
      <button onClick={report} className="px-3 py-1 rounded border">Reportar</button>
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
    </div>
  );
}
