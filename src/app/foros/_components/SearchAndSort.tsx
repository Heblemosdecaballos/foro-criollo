"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchAndSort() {
  const router = useRouter();
  const sp = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "recent");

  // Sincroniza cuando cambian los searchParams externamente
  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setSort(sp.get("sort") ?? "recent");
  }, [sp]);

  const pushParams = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === "") url.searchParams.delete(k);
      else url.searchParams.set(k, v);
    });
    // Siempre vuelve a la página 1 al cambiar q/sort
    url.searchParams.set("page", "1");
    router.push(url.pathname + "?" + url.searchParams.toString());
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ q, sort });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-2 md:items-center">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar en hilos…"
        className="w-full md:w-72 border rounded-xl px-3 py-2"
      />
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          pushParams({ q, sort: e.target.value });
        }}
        className="border rounded-xl px-3 py-2 w-full md:w-auto"
      >
        <option value="recent">Recientes</option>
        <option value="views">Populares</option>
        <option value="active">Activos</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-blue-600 text-white"
      >
        Buscar
      </button>
    </form>
  );
}
