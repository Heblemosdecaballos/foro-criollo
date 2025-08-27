"use client";

import { useState, useTransition } from "react";
import { editPostAction, deletePostAction, reportContentAction } from "./actions";

export default function PostItem({
  post,
  canEdit,
}: {
  post: { id: string; content: string; created_at: string };
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(post.content);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const save = () => {
    const fd = new FormData();
    fd.set("post_id", post.id);
    fd.set("content", value);
    startTransition(async () => {
      const res = await editPostAction(fd);
      setMsg(res.ok ? "Guardado." : (res.message || "Error"));
      if (res.ok) setEditing(false);
    });
  };

  const softDelete = () => {
    if (!confirm("¿Eliminar esta respuesta?")) return;
    const fd = new FormData();
    fd.set("post_id", post.id);
    startTransition(async () => {
      const res = await deletePostAction(fd);
      setMsg(res.ok ? "Eliminada." : (res.message || "Error"));
    });
  };

  const report = () => {
    const reason = prompt("Motivo del reporte:");
    if (!reason) return;
    const fd = new FormData();
    fd.set("target_type", "post");
    fd.set("target_id", post.id);
    fd.set("reason", reason);
    startTransition(async () => {
      const res = await reportContentAction(fd);
      setMsg(res.ok ? "Reporte enviado." : (res.message || "Error"));
    });
  };

  if (editing) {
    return (
      <li className="rounded-xl border bg-white p-3 shadow-sm">
        <textarea className="w-full border rounded p-2" rows={4} value={value} onChange={e => setValue(e.target.value)} />
        <div className="mt-2 flex gap-2">
          <button onClick={save} disabled={pending} className="px-3 py-1 rounded bg-blue-600 text-white">{pending ? "Guardando..." : "Guardar"}</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1 rounded border">Cancelar</button>
        </div>
        {msg && <p className="text-sm text-gray-600 mt-1">{msg}</p>}
      </li>
    );
  }

  return (
    <li className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="whitespace-pre-wrap">{value}</div>
      <p className="text-xs text-gray-500 mt-2">Publicado: {new Date(post.created_at).toLocaleString()}</p>
      <div className="mt-2 flex gap-2">
        {canEdit && <button onClick={() => setEditing(true)} className="px-3 py-1 rounded border">Editar</button>}
        {canEdit && <button onClick={softDelete} className="px-3 py-1 rounded border text-red-600">Eliminar</button>}
        <button onClick={report} className="px-3 py-1 rounded border">Reportar</button>
        {msg && <span className="text-xs text-gray-600">{msg}</span>}
      </div>
    </li>
  );
}
