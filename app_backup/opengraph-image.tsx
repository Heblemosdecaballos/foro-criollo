import { ImageResponse } from 'next/og';

// Ruta: /opengraph-image
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: '#ffffff',
          color: '#111111',
          fontSize: 64,
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.8 }}>Hablemos de Caballos</div>
        <div style={{ fontWeight: 700 }}>Foros</div>
      </div>
    ),
    size
  );
}
