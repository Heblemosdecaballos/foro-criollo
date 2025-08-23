"use client";
import { useState } from "react";

export default function NewThreadForm() {
  const [section, setSection] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ section_slug: section, title, body }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return alert(j?.error || "No se pudo crear el hilo");
    window.location.href = "/foro";
  };

  return (
    <form onSubmit={submit} className="space-y-3 border rounded p-4">
      <h3 className="font-medium">Nuevo hilo</h3>
      <select className="border rounded px-3 py-2" value={section} onChange={e=>setSection(e.target.value)}>
        <option value="general">General</option>
        <option value="en-vivo">En vivo</option>
        <option value="noticias">Noticias</option>
      </select>
      <input className="w-full border rounded px-3 py-2" placeholder="Título"
        value={title} onChange={e=>setTitle(e.target.value)} required />
      <textarea className="w-full border rounded px-3 py-2" placeholder="Contenido"
        value={body} onChange={e=>setBody(e.target.value)} />
      <button className="bg-black text-white rounded px-4 py-2">Publicar</button>
    </form>
  );
}
