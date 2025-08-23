// /src/app/en-vivo/page.tsx
const CH = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

export default function EnVivoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">En Vivo</h1>
      {!CH ? (
        <p className="text-sm text-[#14110F]/70">
          Falta configurar <code>NEXT_PUBLIC_YOUTUBE_CHANNEL_ID</code> en Vercel.
        </p>
      ) : (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#D7D2C7] bg-white">
          {/* Embeber el livestream del canal; si no hay directo, muestra últimos uploads */}
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(CH)}&autoplay=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
