"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({
  total,
  pageSize = 10,
}: {
  total: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const go = (p: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(Math.min(Math.max(1, p), pages)));
    router.push(url.pathname + "?" + url.searchParams.toString());
  };

  if (pages <= 1) return null;

  const around = 1;
  const items: number[] = [];
  for (let p = Math.max(1, page - around); p <= Math.min(pages, page + around); p++) {
    items.push(p);
  }

  return (
    <div className="flex items-center gap-2 justify-center mt-4">
      <button
        onClick={() => go(page - 1)}
        className="px-3 py-1 rounded border disabled:opacity-50"
        disabled={page <= 1}
      >
        ← Anterior
      </button>

      {page - around > 1 && (
        <>
          <button onClick={() => go(1)} className="px-3 py-1 rounded border">1</button>
          <span className="px-1 text-gray-500">…</span>
        </>
      )}

      {items.map((p) => (
        <button
          key={p}
          onClick={() => go(p)}
          className={`px-3 py-1 rounded border ${p === page ? "bg-blue-600 text-white" : ""}`}
        >
          {p}
        </button>
      ))}

      {page + around < pages && (
        <>
          <span className="px-1 text-gray-500">…</span>
          <button onClick={() => go(pages)} className="px-3 py-1 rounded border">{pages}</button>
        </>
      )}

      <button
        onClick={() => go(page + 1)}
        className="px-3 py-1 rounded border disabled:opacity-50"
        disabled={page >= pages}
      >
        Siguiente →
      </button>
    </div>
  );
}
