// src/app/admin/hall/[slug]/page.tsx
import SupabaseUploader from "@/components/SupabaseUploader";
import { getPublicUrl } from "@/utils/supabase/publicUrl";

async function addMedia(slug: string, storage_path: string, media_type: "image" | "video") {
  "use server";
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/hall/${slug}/media`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ storage_path, media_type }),
    cache: "no-store",
  });
}

export default async function AdminHallPage({ params }: { params: { slug: string } }) {
  const base = `${process.env.NEXT_PUBLIC_SITE_URL}/api/hall/${params.slug}`;
  const res = await fetch(base, { cache: "no-store" });
  const { item, media } = res.ok ? await res.json() : { item: null, media: [] as any[] };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin: {item?.title ?? params.slug}</h1>
        <SupabaseUploader
          bucket="hall"
          folder={params.slug}
          onDone={async ({ storagePath, mediaType }) => {
            "use server";
            await addMedia(params.slug, storagePath, mediaType);
          }}
        />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media?.map((m: any) => {
          const url = getPublicUrl(m.storage_path);
          return (
            <div key={m.id} className="border rounded-lg overflow-hidden">
              {m.media_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="w-full h-auto" />
              ) : (
                <video src={url} controls className="w-full h-auto" />
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
