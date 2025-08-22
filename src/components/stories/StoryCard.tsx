"use client";

import Link from "next/link";
import Image from "next/image";

export type Story = {
  id: string | number;
  title?: string | null;
  text?: string | null;
  media?: any[] | null; // [{url, kind}] o array de strings
  created_at?: string | null;
  author?: { name?: string | null; avatar_url?: string | null } | null;
};

function getThumb(media?: any[] | null): { src?: string; isVideo?: boolean } {
  if (!media || !media.length) return {};
  const first = media[0];
  // soporta media como string o como objeto {url, kind}
  const url = typeof first === "string" ? first : first?.url || first?.src;
  const kind = typeof first === "string" ? "" : first?.kind || first?.type || "";
  if (!url) return {};
  const isVideo = /(\.mp4|\.mov|\.webm)$/i.test(url) || /video/i.test(kind);
  return { src: url, isVideo };
}

export default function StoryCard({ story }: { story: Story }) {
  const { id, title, text, media, created_at, author } = story;
  const thumb = getThumb(media);
  const date = created_at
    ? new Date(created_at).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <article className="card overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/historias/${id}`} className="block">
        <div className="relative aspect-[16/10] w-full bg-black/5 dark:bg-white/5">
          {thumb.src ? (
            <>
              {thumb.isVideo ? (
                <div className="absolute left-2 top-2 z-10 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  Video
                </div>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb.src}
                alt={title ?? "Historia"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-black/40 dark:text-white/40">
              Sin imagen
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="line-clamp-2">{title ?? "Historia"}</h3>
          {text ? (
            <p className="text-sm text-black/70 dark:text-white/70 line-clamp-2">
              {text}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
            {author?.avatar_url ? (
              <Image
                src={author.avatar_url}
                alt={author.name ?? "Autor"}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-black/10 dark:bg-white/10" />
            )}
            <span className="truncate">{author?.name ?? "Autor"}</span>
            <span>·</span>
            <time dateTime={created_at ?? undefined}>{date}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
