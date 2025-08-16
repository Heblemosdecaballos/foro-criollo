// app/admin/ads/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

export default function AdsAdmin() {
  const supabase = supa();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ slot: "hero", image_url: "", link_url: "", html: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    supabase.from("ads").select("*").order("created_at",{ascending:false}).then(({data}) => setItems(data ?? []));
  }, []);

  async function save() {
    if (!user) { alert("Inicia sesión"); return; }
    if (!form.html && (!form.image_url || !form.link_url)) { alert("Sube imagen+link o pega HTML"); return; }
    setSaving(true);
    const { error } = await supabase.from("ads").insert({
      author_id: user.id, slot: form.slot, image_url: form.image_url || null,
      link_url: form.link_url || null, html: form.html || null
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    location.reload();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Publicidad (Admin)</h1>

      <section className="rounded border p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Slot</span>
            <select value={form.slot} onChange={e=>setForm({...form, slot: e.target.value})}
              className="w-full rounded border p-2">
              <option>hero</option>
              <option>header</option>
              <option>sidebar</option>
              <option>inline</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Link (si es imagen)</span>
            <input className="w-full rounded border p-2" value={form.link_url}
              onChange={e=>setForm({...form, link_url: e.target.value})} placeholder="https://patrocinador.com" />
          </label>

          <label className="sm:col-span-2 text-sm">
            <span className="mb-1 block text-neutral-600">Imagen (URL pública)</span>
            <input className="w-full rounded border p-2" value={form.image_url}
              onChange={e=>setForm({...form, image_url: e.target.value})} placeholder="https://.../banner.jpg" />
            <small className="text-neutral-500">Puedes subir la imagen a Supabase Storage y pegar la URL pública.</small>
          </label>

          <label className="sm:col-span-2 text-sm">
            <span className="mb-1 block text-neutral-600">HTML (opcional - AdSense/GAM)</span>
            <textarea rows={5} className="w-full rounded border p-2 font-mono"
              value={form.html} onChange={e=>setForm({...form, html: e.target.value})}
              placeholder="Pega aquí el snippet si usas AdSense/GAM"></textarea>
          </label>
        </div>

        <div className="flex justify-end">
          <button onClick={save} disabled={!user || saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Guardando…" : "Guardar anuncio"}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Últimos anuncios</h2>
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="rounded border p-3">
              <div className="text-xs text-neutral-500">{a.slot} · {new Date(a.created_at).toLocaleString()}</div>
              {a.image_url && a.link_url ? (
                <a href={a.link_url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image_url} alt="ad" className="mt-2 h-auto w-full max-w-lg rounded" />
                </a>
              ) : a.html ? (
                <div className="mt-2 border p-2 text-xs text-neutral-600 overflow-auto">
                  <pre className="whitespace-pre-wrap">{a.html}</pre>
                </div>
              ) : null}
            </div>
          ))}
          {items.length === 0 && <div className="rounded border border-dashed p-4 text-center text-neutral-500">Sin anuncios aún</div>}
        </div>
      </section>
    </main>
  );
}
