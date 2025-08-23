// app/admin/pages/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

type PageRow = { slug: string; title: string; body: string; published: boolean; updated_at: string };

export default function PagesAdmin() {
  const supabase = supa();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<PageRow[]>([]);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", body: "", published: true });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/pages?all=1", { cache: "no-store" });
    if (res.status === 401) { setItems([]); return; }
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    load();
  }, []);

  async function saveNew() {
    if (!user) { alert("Inicia sesión"); return; }
    if (!form.slug || !form.title || !form.body) { alert("Completa slug, título y cuerpo"); return; }
    setSaving(true);
    const res = await fetch("/api/pages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) return alert("Error al crear");
    setForm({ slug: "", title: "", body: "", published: true });
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/pages/${editing.slug}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    setSaving(false);
    if (!res.ok) return alert("Error al guardar");
    setEditing(null);
    load();
  }

  async function remove(slug: string) {
    if (!confirm("¿Eliminar página?")) return;
    const res = await fetch(`/api/pages/${slug}`, { method: "DELETE" });
    if (!res.ok) return alert("Error al eliminar");
    load();
  }

  return (
    <main className="mx-auto max-w-5xl p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Páginas (Admin)</h1>

      {!user && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
          Inicia sesión para crear/editar páginas.
        </div>
      )}

      {/* Crear nueva */}
      <section className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Crear página</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Slug (sin espacios)</span>
            <input className="w-full rounded border p-2" value={form.slug}
              onChange={(e)=>setForm({...form, slug: e.target.value.trim().toLowerCase()})}
              placeholder="quienes-somos" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Título</span>
            <input className="w-full rounded border p-2" value={form.title}
              onChange={(e)=>setForm({...form, title: e.target.value})} />
          </label>
          <label className="sm:col-span-2 text-sm">
            <span className="mb-1 block text-neutral-600">Cuerpo</span>
            <textarea rows={8} className="w-full rounded border p-2 font-sans"
              value={form.body} onChange={(e)=>setForm({...form, body: e.target.value})}
              placeholder="Puedes pegar HTML simple o texto con saltos de línea." />
          </label>
          <label className="text-sm">
            <input type="checkbox" checked={form.published}
              onChange={(e)=>setForm({...form, published: e.target.checked})} />{" "}
            Publicada
          </label>
        </div>
        <div className="flex justify-end">
          <button onClick={saveNew} disabled={!user || saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Guardando…" : "Crear"}
          </button>
        </div>
      </section>

      {/* Listado + edición rápida */}
      <section className="space-y-2">
        <h2 className="font-medium">Mis páginas</h2>
        <div className="space-y-3">
          {items.map(p => (
            <div key={p.slug} className="rounded border p-3">
              {editing?.slug === p.slug ? (
                <div className="space-y-2">
                  <input className="w-full rounded border p-2" value={editing.title}
                    onChange={(e)=>setEditing({...editing!, title: e.target.value})} />
                  <textarea rows={8} className="w-full rounded border p-2"
                    value={editing.body}
                    onChange={(e)=>setEditing({...editing!, body: e.target.value})} />
                  <label className="text-sm">
                    <input type="checkbox" checked={editing.published}
                      onChange={(e)=>setEditing({...editing!, published: e.target.checked})} />{" "}
                    Publicada
                  </label>
                  <div className="flex gap-2">
                    <button onClick={saveEdit}
                      className="rounded bg-blue-600 px-3 py-1.5 text-white">Guardar</button>
                    <button onClick={()=>setEditing(null)}
                      className="rounded border px-3 py-1.5">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-neutral-500">{p.slug} · {new Date(p.updated_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/p/${p.slug}`} className="rounded border px-3 py-1.5" target="_blank">Ver</a>
                    <button onClick={()=>setEditing(p)} className="rounded border px-3 py-1.5">Editar</button>
                    <button onClick={()=>remove(p.slug)} className="rounded border px-3 py-1.5 text-red-600">Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded border border-dashed p-4 text-center text-neutral-500">
              Aún no tienes páginas.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
