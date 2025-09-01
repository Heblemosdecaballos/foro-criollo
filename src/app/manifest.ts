
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hablando de Caballos',
    short_name: 'HablaCaballos',
    description: 'Comunidad hispana del mundo ecuestre. Foros, debates y recursos sobre caballos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5dc',
    theme_color: '#8b4513',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'es',
    categories: ['sports', 'lifestyle', 'social'],
    icons: [
      {
        src: '/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: 'Foros',
        short_name: 'Foros',
        description: 'Acceder a los foros de discusión',
        url: '/foros',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'Hall of Fame',
        short_name: 'Hall',
        description: 'Ver el Hall of Fame',
        url: '/hall',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'En Vivo',
        short_name: 'Live',
        description: 'Transmisiones en vivo',
        url: '/en-vivo',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
      }
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png'
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png'
      }
    ]
  };
}
