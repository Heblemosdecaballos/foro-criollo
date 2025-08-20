/* app/hall/[slug]/page.tsx */
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import AddMediaForm from "./AddMediaForm";
import HallCommentForm from "./HallCommentForm";
import VoteButton from "./VoteButton";

type Params = { params: { slug: string } };

const GAITS: Record<string, string> = {
  trocha_galope: "Trocha y Galope",
  trote_galope: "Trote y Galope",
  trocha_colombia: "Trocha Colombia",
  paso_fino: "Paso Fino Colombiano",
};

export default async function HallProfilePage({ params }: Params) {
  const supabase = createSupabaseServerClient();

  // sesión (para mostrar botones/acciones de usuario)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const viewerId = session?.user?.id ?? null;

  // obtenemos el perfil por slug
  const { data: profile, error: profErr } = await supabase
    .from("hall_profiles")
    .select(
      `
      id,
      slug,
      title,
      year,
      gait,
      cover_url,
      votes_count
    `
    )
    .eq("slug", params.slug)
    .maybeSingle();

  if (profErr) {
    // Si hay error de RLS o similar evita page crash
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold mb-2">No se pudo cargar el perfil</h1>
        <p className="text-muted">
          {profErr.message}
        </p>
        <div className="mt-6">
          <Link href="/hall" className="btn btn-primary">Volver al Hall</Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold mb-2">Caballo no encontrado</h1>
        <div className="mt-6">
          <Link href="/hall" className="btn btn-primary">Volver al Hall</Link>
        </div>
      </div>
    );
  }

  // ¿Es admin? (para mostrar el form de subir medios)
  let viewerIsAdmin = false;
  if (viewerId) {
    const { data: isAdmin } = await supabase.rpc("is_admin", { uid: viewerId });
    viewerIsAdmin = !!isAdmin;
  }

  // galería
  const { data: media = [] } = await supabase
    .from("hall_media")
    .select("id, url, caption, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  // comentarios (si ya los listabas en server)
  const { data: comments = [] } = await supabase
    .from("hall_comments")
    .select("id, user_name, content, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true });

  return (
    <div className="container py-8 space-y-10">
      {/* Cabecera */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="w-full">
          {profile.cover_url ? (
            <div className="overflow-hidden rounded-2xl">
              {/* NO recortamos: contenemos la imagen */}
              <Image
                src={profile.cover_url}
                alt={profile.title}
                width={1600}
                height={1200}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/20 aspect-[4/3]" />
          )}
        </div>

        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-muted">
            {GAITS[profile.gait] ?? "Andar"} {profile.year ? `· ${profile.year}` : ""}
          </div>
          <h1 className="text-3xl font-bold">{profile.title}</h1>

          <div className="flex items-center gap-3">
            <VoteButton profileId={profile.id} />
            <Link href="/hall" className="text-sm underline">
              Volver al Hall
            </Link>
          </div>
        </div>
      </div>

      {/* Galería */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Galería</h2>

        {media.length === 0 ? (
          <p className="text-muted">Aún no hay fotos.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((m) => (
              <li key={m.id} className="rounded-xl border overflow-hidden bg-white">
                <Image
                  src={m.url}
                  alt={m.caption ?? profile.title}
                  width={1000}
                  height={800}
                  className="w-full h-auto object-contain"
                />
                {m.caption ? (
                  <div className="px-3 py-2 text-xs text-muted">{m.caption}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Comentarios */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Comentarios</h2>

        {comments.length === 0 ? (
          <p className="text-muted">Sé el primero en comentar.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-xl border p-3">
                <div className="text-xs text-muted mb-1">{c.user_name}</div>
                <div className="text-sm">{c.content}</div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulario para comentar (pasamos viewerName si lo necesitas) */}
        <HallCommentForm
          profileId={profile.id}
          slug={profile.slug}
          viewerName={
            session?.user?.user_metadata?.full_name ??
            session?.user?.email?.split("@")?.[0] ??
            "usuario"
          }
        />
      </section>

      {/* === AQUÍ movemos el uploader AL FINAL, debajo de comentarios === */}
      {viewerIsAdmin ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Añadir foto o video</h2>
          <p className="text-sm text-muted">
            Solo administradores pueden subir archivos. (Los permisos de escritura ya están
            resueltos por RLS y <code>public.is_admin</code>).
          </p>
          <AddMediaForm profileId={profile.id} slug={profile.slug} />
        </section>
      ) : null}
    </div>
  );
}
