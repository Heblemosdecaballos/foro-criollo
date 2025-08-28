import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import ReportRow from "./report-row";

export const dynamic = "force-dynamic";

type Report = {
  id: string;
  reporter_id: string | null;
  target_type: "thread" | "post";
  target_id: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
};

const PAGE_SIZE = 20;

export default async function ModeracionPage({
  searchParams,
}: {
  searchParams?: { status?: string; q?: string; page?: string };
}) {
  const supabase = supabaseServer();

  // auth & mod check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: me } = await supabase
    .from("profiles")
    .select("is_moderator")
    .eq("id", user.id)
    .single();

  if (!me?.is_moderator) notFound();

  const status = (searchParams?.status ?? "open").toLowerCase();
  const q = (searchParams?.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10));

  // base query
  let query = supabase
    .from("forum_reports")
    .select("id, reporter_id, target_type, target_id, reason, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (["open", "reviewing", "resolved", "dismissed"].includes(status)) {
    query = query.eq("status", status as any);
  }

  if (q) {
    // simple filtro por reason
    query = query.ilike("reason", `%${q}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: reports, count } = await query.range(from, to);

  // Enriquecer con títulos/links
  const threadTargetIds = (reports ?? [])
    .filter(r => r.target_type === "thread")
    .map(r => r.target_id);

  const postTargetIds = (reports ?? [])
    .filter(r => r.target_type === "post")
    .map(r => r.target_id);

  const threadsById = new Map<string, any>();
  if (threadTargetIds.length) {
    const { data: ths } = await supabase
      .from("threads")
      .select("id, slug, title, is_deleted")
      .in("id", threadTargetIds);
    for (const t of ths ?? []) threadsById.set(t.id, t);
  }

  const postsById = new Map<string, any>();
  const postThreadIds = new Set<string>();
  if (postTargetIds.length) {
    const { data: pts } = await supabase
      .from("posts")
      .select("id, thread_id, is_deleted")
      .in("id", postTargetIds);
    for (const p of pts ?? []) {
      postsById.set(p.id, p);
      postThreadIds.add(p.thread_id);
    }
  }

  if (postThreadIds.size) {
    const { data: postThreads } = await supabase
      .from("threads")
      .select("id, slug, title, is_deleted")
      .in("id", Array.from(postThreadIds));
    for (const t of postThreads ?? []) threadsById.set(t.id, t);
  }

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Moderación</h1>
        <div className="text-sm text-gray-600">
          {total} reporte(s){status ? ` • Estado: ${status}` : ""}
        </div>
      </div>

      {/* Filtros */}
      <form className="flex flex-col md:flex-row gap-2">
        <select
          name="status"
          defaultValue={status}
          className="border rounded px-3 py-2"
        >
          <option value="open">Abiertos</option>
          <option value="reviewing">En revisión</option>
          <option value="resolved">Resueltos</option>
          <option value="dismissed">Descartados</option>
        </select>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Filtrar por motivo…"
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="px-4 py-2 rounded bg-blue-600 text-white">Aplicar</button>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Motivo</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(reports ?? []).map((r) => {
              let link = "#";
              let title = "";
              let hidden = false;

              if (r.target_type === "thread") {
                const t = threadsById.get(r.target_id);
                if (t) {
                  link = `/foros/${t.slug}`;
                  title = t.title ?? "";
                  hidden = !!t.is_deleted;
                }
              } else {
                const p = postsById.get(r.target_id);
                if (p) {
                  const t = threadsById.get(p.thread_id);
                  if (t) {
                    link = `/foros/${t.slug}`;
                    title = t.title ?? "";
                    hidden = !!p.is_deleted;
                  }
                }
              }

              return (
                <ReportRow
                  key={r.id}
                  report={{
                    id: r.id,
                    created_at: r.created_at,
                    target_type: r.target_type,
                    target_id: r.target_id,
                    reason: r.reason,
                    status: r.status,
                    link,
                    title,
                    hidden,
                  }}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación simple */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
          const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/foros/moderacion`);
          if (status) url.searchParams.set("status", status);
          if (q) url.searchParams.set("q", q);
          url.searchParams.set("page", String(p));
          return (
            <Link
              key={p}
              href={`/foros/moderacion?status=${encodeURIComponent(status)}${q ? `&q=${encodeURIComponent(q)}` : ""}&page=${p}`}
              className={`px-3 py-1 rounded border ${p === page ? "bg-blue-600 text-white" : ""}`}
            >
              {p}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
