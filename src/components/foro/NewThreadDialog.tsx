// /src/components/foro/NewThreadDialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase/browser";

const CATEGORIES = ["General", "Compra/Venta", "Entrenamiento", "Eventos"];

export default function NewThreadDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "").trim();
    const body = String(fd.get("body") || "").trim();
    const category = String(fd.get("category") || "General");

    if (!title) return alert("Título requerido");

    setLoading(true);
    const supabase = supabaseBrowser();

    const { data, error } = await supabase
      .from("threads")
      .insert({ title, body, category })
      .select("id")
      .single();

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setOpen(false);
    router.push(`/foro/${data!.id}`);
  }

  return (
    <div className="mb-4">
      <button
        className="rounded-lg border border-[#CFC8B9] bg-white px-3 py-2 text-sm hover:bg-[#F8F5EC]"
        onClick={() => setOpen(true)}
      >
        Nuevo hilo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/20 p-4" onClick={() => !loading && setOpen(false)}>
          <div
            className="mx-auto mt-20 w-full max-w-xl rounded-xl border border-[#D7D2C7] bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-semibold">Publicar nuevo hilo</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Título</label>
                <input
                  name="title"
                  required
                  className="mt-1 w-full rounded-lg border border-[#CFC8B9] bg-[#F8F5EC] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm">Categoría</label>
                <select
                  name="category"
                  className="mt-1 w-full rounded-lg border border-[#CFC8B9] bg-[#F8F5EC] px-3 py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm">Contenido</label>
                <textarea
                  name="body"
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-[#CFC8B9] bg-[#F8F5EC] px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={loading}
                  className="rounded-lg border border-[#14110F] bg-white px-3 py-2 text-sm"
                >
                  {loading ? "Publicando…" : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[#CFC8B9] bg-[#F8F5EC] px-3 py-2 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
