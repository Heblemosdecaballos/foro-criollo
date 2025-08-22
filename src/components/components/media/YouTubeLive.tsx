// components/media/YouTubeLive.tsx
type Props = {
  channelId?: string
  videoId?: string
  autoplay?: boolean
  muted?: boolean
  title?: string
}
export default function YouTubeLive({ channelId, videoId, autoplay, muted, title }: Props) {
  // Si pasas videoId, embebe ese; si no, el live del canal
  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=${autoplay?1:0}&mute=${muted?1:0}`
    : `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=${autoplay?1:0}&mute=${muted?1:0}`

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-card border border-black/5 bg-white">
      <div className="aspect-video">
        <iframe
          className="w-full h-full"
          src={src}
          title={title ?? 'YouTube Live'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
