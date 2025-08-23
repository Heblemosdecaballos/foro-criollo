// app/admin/news/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

type Row = {
  slug: string; title: string; excerpt: string | null; body: string;
  cover_url: string | null; published: boolean; created_at: string; updated_at: string;
};

export default function NewsAdmin() {
  const sb = supa();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Row[]>([]);
  const [form, setForm] = useState({ slug: "", title: "", excerpt: "", body: "", published: true, cover_url: "" });
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const r = await fetch("/api/news?all=1", { cache: "no-store" });
    if (r.status === 401) return setItems([]);
    const j = await r.json(); setItems(j.items ?? []);
  }

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    load();
  }, []);

  async function uploadCover(file: File) {
    if (!user) return;
    setUploading(true);
    const path = `news/${user.id}/${Date.now()}-${file.name}`;
    const { error } = await sb.storage.from("news").upload(path, file, { upsert: false });
    setUploading(false);
    if (error) { alert(error.message); return; }
    const { data } = sb.storage.from("news").getPublicUrl(path);
    return data.publicUrl as string;
  }

  async function saveNew() {
    if (!user) { alert("Inicia sesión"); return; }
    const body = { ...form, excerpt: form.excerpt || null, cover_url: form.cover_url || null };
    setSaving(true);
    const r = await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!r.ok) return alert("Error al crear");
    setForm({ slug: "", title: "", excerpt: "", body: "", published: true, cover_url: "" });
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const r = await fetch(`/api/news/${editing.slug}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    setSaving(false);
    if (!r.ok) return alert("Error al guardar");
    setEditing(null); load();
  }

  async function remove(slug: string) {
    if (!confirm("¿Eliminar noticia?")) return;
    const r = await fetch(`/api/news/${slug}`, { method: "DELETE" });
    if (!r.ok) return alert("Error al eliminar");
    load();
  }

  return (
    <main className="mx-auto max-w-5xl p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Noticias (Admin)</h1>

      {!user && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
          Inicia sesión para crear/editar noticias.
        </div>
      )}

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Crear noticia</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Slug</span>
            <input className="w-full rounded border p-2"
              value={form.slug}
              onChange={e=>setForm({...form, slug: e.target.value.trim().toLowerCase()})}
              placeholder="mundial-2025" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Título</span>
            <input className="w-full rounded border p-2"
              value={form.title}
              onChange={e=>setForm({...form, title: e.target.value})} />
          </label>
          <label className="sm:col-span-2 text-sm">
            <span className="mb-1 block text-neutral-600">Bajada / Extracto (opcional)</span>
            <input className="w-full rounded border p-2"
              value={form.excerpt}
              onChange={e=>setForm({...form, excerpt: e.target.value})} />
          </label>
          <label className="sm:col-span-2 text-sm">
            <span className="mb-1 block text-neutral-600">Cuerpo</span>
            <textarea rows={8} className="w-full rounded border p-2"
              value={form.body}
              onChange={e=>setForm({...form, body: e.target.value})}
              placeholder="Puedes pegar HTML simple o texto." />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Portada (URL pública)</span>
            <input className="w-full rounded border p-2"
              value={form.cover_url}
              onChange={e=>setForm({...form, cover_url: e.target.value})}
              placeholder="https://..." />
            <input
              type="file" accept="image/*" className="mt-2"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadCover(f);
                if (url) setForm(prev => ({ ...prev, cover_url: url }));
              }}
              disabled={!user || uploading}
            />
            <small className="text-neutral-500">{uploading ? "Subiendo…" : "Puedes seleccionar un archivo para subir al bucket `news`."}</small>
          </label>

          <label className="text-sm">
            <input type="checkbox" checked={form.published}
              onChange={e=>setForm({...form, published: e.target.checked})} /> Publicada
          </label>
        </div>

        <div className="flex justify-end">
          <button onClick={saveNew} disabled={!user || saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Guardando…" : "Crear"}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Mis noticias</h2>
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.slug} className="rounded border p-3">
              {editing?.slug === n.slug ? (
                <div className="space-y-2">
                  <input className="w-full rounded border p-2" value={editing.title}
                    onChange={e=>setEditing({...editing!, title: e.target.value})} />
                  <input className="w-full rounded border p-2" value={editing.excerpt ?? ""}
                    onChange={e=>setEditing({...editing!, excerpt: e.target.value})} placeholder="Extracto..." />
                  <textarea rows={8} className="w-full rounded border p-2"
                    value={editing.body}
                    onChange={e=>setEditing({...editing!, body: e.target.value})} />
                  <input className="w-full rounded border p-2" value={editing.cover_url ?? ""}
                    onChange={e=>setEditing({...editing!, cover_url: e.target.value})} placeholder="URL portada" />
                  <label className="text-sm">
                    <input type="checkbox" checked={editing.published}
                      onChange={e=>setEditing({...editing!, published: e.target.checked})} /> Publicada
                  </label>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="rounded bg-blue-600 px-3 py-1.5 text-white">Guardar</button>
                    <button onClick={()=>setEditing(null)} className="rounded border px-3 py-1.5">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {n.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.cover_url} alt="cover" className="h-12 w-20 rounded object-cover" />
                    )}
                    <div>
                      <div className="font-medium">{n.title}</div>
                      <div className="text-xs text-neutral-500">
                        {n.slug} · {new Date(n.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a className="rounded border px-3 py-1.5" href={`/noticias/${n.slug}`} target="_blank">Ver</a>
                    <button onClick={()=>setEditing(n)} className="rounded border px-3 py-1.5">Editar</button>
                    <button onClick={()=>remove(n.slug)} className="rounded border px-3 py-1.5 text-red-600">Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded border border-dashed p-4 text-center text-neutral-500">
              Aún no tienes noticias.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
