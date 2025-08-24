import SupabaseUploader from "@/components/SupabaseUploader";
import HallAddYoutubeForm from "@/components/HallAddYoutubeForm";
import { getPublicUrl } from "@/utils/supabase/publicUrl";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHallPage({ params }: { params: { slug: string } }) {
  const base = `/api/hall/${params.slug}`;
  const res = await fetch(base, { cache: "no-store" });
  const { item, media } = res.ok ? await res.json() : { item: null, media: [] as any[] };

  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin: {item?.title ?? params.slug}</h1>
        {!user ? (
          <a href="/login" className="underline">Inicia sesión</a>
        ) : (
          <div className="flex gap-2">
            <SupabaseUploader bucket="hall" folder={params.slug} postUrl={`/api/hall/${params.slug}/media`} />
          </div>
        )}
      </header>

      {user && (
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Agregar video de YouTube</h2>
          <HallAddYoutubeForm slug={params.slug} />
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media?.map((m: any) => {
          const raw = String(m.storage_path || "");
          const url = getPublicUrl(raw);
          const isYouTube = /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(raw);
          const ytId = isYouTube
            ? raw.match(/[?&]v=([^&]+)/)?.[1] ||
              raw.match(/youtu\.be\/([^?&/]+)/)?.[1] ||
              raw.match(/\/embed\/([^?&/]+)/)?.[1] ||
              raw.match(/\/shorts\/([^?&/]+)/)?.[1] || ""
            : "";

          return (
            <div key={m.id} className="border rounded-lg overflow-hidden">
              {m.media_type === "image" && <img src={url} alt="" className="w-full h-auto" />}
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
        })}
      </section>
    </main>
  );
}
