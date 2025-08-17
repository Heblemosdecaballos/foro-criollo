// app/admin/ads/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

type AdRow = {
  id: string;
  slot: string;
  image_url: string | null;
  link_url: string | null;
  html: string | null;
  active: boolean;
  created_at: string;
};

export default function AdsAdmin() {
  const sb = supa();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<AdRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slot: "hero",
    link_url: "",
    image_url: "",
    html: "",
    active: true,
  });

  async function load() {
    const r = await fetch("/api/ads?all=1", { cache: "no-store" });
    if (r.status === 401) { setItems([]); return; }
    const j = await r.json();
    setItems(j.items ?? []);
  }

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    load();
  }, []);

  async function save() {
    if (!user) { alert("Inicia sesión"); return; }
    if (!form.slot) return alert("Elige un slot");
    if (!form.html && !(form.image_url && form.link_url)) {
      return alert("Debes pegar HTML o bien Imagen + Link");
    }
    setSaving(true);
    const r = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "No se pudo guardar");
      return;
    }
    setForm({ slot: "hero", link_url: "", image_url: "", html: "", active: true });
    load();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Anuncios (Admin)</h1>

      {!user && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
          Inicia sesión para crear anuncios.
        </div>
      )}

      <section className="rounded border p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Slot</div>
            <select
              className="w-full rounded border p-2"
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: e.target.value })}
            >
              <option value="hero">hero</option>
              <option value="sidebar">sidebar</option>
              <option value="sidebar-2">sidebar-2</option>
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Link (si es imagen)</div>
            <input
              className="w-full rounded border p-2"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://patrocinador.com"
            />
          </label>

          <label className="sm:col-span-2 text-sm">
            <div className="mb-1 text-neutral-600">Imagen (URL pública)</div>
            <input
              className="w-full rounded border p-2"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://.../banner.jpg"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Puedes subir la imagen a Supabase Storage y pegar la URL pública.
            </p>
          </label>

          <label className="sm:col-span-2 text-sm">
            <div className="mb-1 text-neutral-600">HTML (opcional — AdSense/GAM)</div>
            <textarea
              className="w-full rounded border p-2"
              rows={6}
              value={form.html}
              onChange={(e) => setForm({ ...form, html: e.target.value })}
              placeholder="Pega aquí el snippet si usas AdSense/GAM"
            />
          </label>

          <label className="text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            Activo
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={!user || saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar anuncio"}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Últimos anuncios</h2>
        {items.length === 0 ? (
          <div className="rounded border border-dashed p-4 text-center text-neutral-500">
            Sin anuncios aún
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="rounded border p-3">
                <div className="text-xs text-neutral-500">
                  {a.slot} · {new Date(a.created_at).toLocaleString()} · {a.active ? "Activo" : "Inactivo"}
                </div>
                {a.html ? (
                  <div className="mt-2 text-xs text-neutral-600">
                    (HTML pegado — no se previsualiza por seguridad)
                  </div>
                ) : a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt="banner" className="mt-2 h-24 rounded object-contain" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
