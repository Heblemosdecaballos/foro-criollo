import Link from "next/link";

export default function Pagination({
  page,
  pageCount,
  basePath,
  q,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  q?: string;
}) {
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const build = (p: number) => {
    const sp = new URLSearchParams();
    sp.set("page", String(p));
    if (q) sp.set("q", q);
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <nav className="mt-6 flex items-center justify-center gap-3">
      <Link
        href={hasPrev ? build(page - 1) : "#"}
        aria-disabled={!hasPrev}
        className={`btn-outline ${!hasPrev ? "pointer-events-none opacity-50" : ""}`}
      >
        ← Anterior
      </Link>
      <span className="text-sm">
        Página <b>{page}</b> de <b>{pageCount}</b>
      </span>
      <Link
        href={hasNext ? build(page + 1) : "#"}
        aria-disabled={!hasNext}
        className={`btn-outline ${!hasNext ? "pointer-events-none opacity-50" : ""}`}
      >
        Siguiente →
      </Link>
    </nav>
  );
}
