// src/app/admin/hall/[slug]/page.tsx
import SupabaseUploader from "@/components/SupabaseUploader";
import { getPublicUrl } from "@/utils/supabase/publicUrl";

export const dynamic = "force-dynamic";

export default async function AdminHallPage({ params }: { params: { slug: string } }) {
  const base = `${process.env.NEXT_PUBLIC_SITE_URL}/api/hall/${params.slug}`;
  const res = await fetch(base, { cache: "no-store" });
  const { item, media } = res.ok ? await res.json() : { item: null, media: [] as any[] };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Admin: {item?.title ?? params.slug}
        </h1>
        <SupabaseUploader
          bucket="hall"
          folder={params.slug}
          postUrl={`/api/hall/${params.slug}/media`}
        />
      </header>

      {/* Media (Soporte YouTube + archivos de Supabase) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media?.length ? (
          media.map((m: any) => {
            const raw = String(m.storage_path || "");
            const url = getPublicUrl(raw); // si es http(s) lo deja igual, si es 'bucket/path' lo convierte
            const isYouTube = /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(
              raw
            );

            // Extraer ID de YouTube (v=..., youtu.be/..., embed/..., shorts/...)
            const ytId = isYouTube
              ? raw.match(/[?&]v=([^&]+)/)?.[1] ||
                raw.match(/youtu\.be\/([^?&/]+)/)?.[1] ||
                raw.match(/\/embed\/([^?&/]+)/)?.[1] ||
                raw.match(/\/shorts\/([^?&/]+)/)?.[1] ||
                ""
              : "";

            return (
              <div key={m.id} className="border rounded-lg overflow-hidden">
                {m.media_type === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="w-full h-auto" />
                )}

                {m.media_type === "video" && isYouTube && ytId && (
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}

                {m.media_type === "video" && (!isYouTube || !ytId) && (
                  <video src={url} controls className="w-full h-auto" />
                )}
              </div>
            );
          })
        ) : (
          <p className="opacity-70">Sin media aún.</p>
        )}
      </section>
    </main>
  );
}
