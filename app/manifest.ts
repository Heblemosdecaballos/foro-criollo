import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foro-criollo.vercel.app';

  return {
    name: 'Hablemos de Caballos — Foros',
    short_name: 'Foro Caballos',
    description: 'Foros de Hablemos de Caballos: crea hilos, responde y modera contenido.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    lang: 'es',
    dir: 'ltr',
    icons: [
      // PNGs recomendados (póngalos en /public/icons/)
      { src: `${baseUrl}/icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${baseUrl}/icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Mascara para iOS/Android (opcional)
      { src: `${baseUrl}/icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      // Opcional, mejora fichas en Android/Chrome
      // { src: `${baseUrl}/screenshots/home.png`, sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
    ],
    categories: ['social', 'forums', 'communication'],
    related_applications: [],
    prefer_related_applications: false,
  };
}
