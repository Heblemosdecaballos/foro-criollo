// app/en-vivo/page.tsx
import YouTubeLive from '@/components/media/YouTubeLive'

export const revalidate = 0

export default function EnVivoPage() {
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Transmisión en vivo</h1>
      {!channelId ? (
        <p className="text-red-700">
          Falta configurar <code>NEXT_PUBLIC_YOUTUBE_CHANNEL_ID</code> en Vercel.
        </p>
      ) : (
        <YouTubeLive channelId={channelId} autoplay muted title="En vivo" />
      )}

      <p className="text-muted">
        Si el canal no está en directo, YouTube mostrará el último estado disponible del canal.
      </p>
    </div>
  )
}
