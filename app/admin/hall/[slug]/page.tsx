/* app/admin/hall/[slug]/page.tsx */
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type Params = { params: { slug: string } };

export default async function HallAdminEditPage({ params }: Params) {
  const supabase = createSupabaseServerClient();

  // sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) redirect("/admin?m=signin");

  // admin?
  const { data: isAdmin } = await supabase.rpc("is_admin", { uid: session.user.id });
  if (!isAdmin) redirect("/admin?m=forbidden");

  // perfil
  const { data: profile, error: profErr } = await supabase
    .from("hall_profiles")
    .select(
      `
      id, slug, title, year, gait, cover_url, votes_count
    `
    )
    .eq("slug", params.slug)
    .maybeSingle();

  // si falló RLS o no existe, no reventamos la página
  if (profErr || !profile) {
    return (
      <div className="container py-10 space-y-6">
        <h1 className="text-2xl font-semibold">Editor del Hall</h1>
        <div className="rounded-lg border bg-red-50 p-4 text-sm">
          <div className="font-medium mb-1">No se pudo cargar el perfil</div>
          <div>{profErr?.message ?? "Perfil inexistente o sin permisos"}</div>
        </div>
        <Link href="/admin" className="btn btn-primary">Volver al panel</Link>
      </div>
    );
  }

  // medios (para listar lo que ya subiste)
  const { data: media = [] } = await supabase
    .from("hall_media")
    .select("id, url, caption, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editor del Hall</h1>
        <Link href={`/hall/${profile.slug}`} className="text-sm underline">
          Ver ficha pública
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border overflow-hidden">
            {profile.cover_url ? (
              <Image
                src={profile.cover_url}
                alt={profile.title}
                width={1400}
                height={900}
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="aspect-[4/3] bg-muted/20" />
            )}
          </div>

          {/* Aquí podrías poner tu formulario de edición (título, año, andar, etc.) */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="text-sm text-muted">ID: {profile.id}</div>
            <div className="text-sm text-muted">Slug: {profile.slug}</div>
            <div className="text-sm text-muted">Andar: {profile.gait}</div>
            <div className="text-sm text-muted">Año: {profile.year ?? "-"}</div>
          </div>
        </div>

        <aside className="space-y-4">
          <h2 className="text-lg font-semibold">Medios</h2>
          {media.length === 0 ? (
            <p className="text-muted text-sm">Aún no hay archivos.</p>
          ) : (
            <ul className="space-y-3">
              {media.map((m) => (
                <li key={m.id} className="rounded-lg border p-2 flex gap-3">
                  <div className="w-24 shrink-0 overflow-hidden rounded">
                    <Image
                      src={m.url}
                      alt={m.caption ?? profile.title}
                      width={200}
                      height={150}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{m.caption ?? "(Sin leyenda)"}</div>
                    <div className="text-muted">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/hall/${profile.slug}`} className="btn btn-secondary w-full">
            Abrir ficha pública
          </Link>
        </aside>
      </section>
    </div>
  );
}
