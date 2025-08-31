'use client';

import { useTransition, useRef } from 'react';
import { uploadMediaAction, setCoverAction } from './actions';

type Media = { id: string; public_url: string; is_cover: boolean };

export default function UploadMediaBlock(props: {
  horseId: string;
  andarSlug: string;
  horseSlug: string;
  mediaList: Media[];
  canUpload: boolean;
}) {
  const { horseId, andarSlug, horseSlug, mediaList, canUpload } = props;
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await uploadMediaAction(fd);
      if (!res.ok) {
        alert(res.message || 'No se pudo subir.');
        return;
      }
      alert('Imagen subida ✔');
      if (fileRef.current) fileRef.current.value = '';
      // window.location.reload(); // opcional
    });
  }

  function handleSetCover(mediaId: string) {
    start(async () => {
      const res = await setCoverAction({ horseId, mediaId, andarSlug, horseSlug });
      if (!res.ok) alert(res.message || 'No se pudo marcar portada');
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Subir media</h3>

      {canUpload ? (
        <form onSubmit={onSubmit} className="space-y-2">
          <input type="hidden" name="horseId" value={horseId} />
          <input type="hidden" name="andarSlug" value={andarSlug} />
          <input type="hidden" name="horseSlug" value={horseSlug} />
          <input ref={fileRef} name="file" type="file" accept="image/*" required />
          <p className="text-sm text-gray-500">Límite: 10 MB</p>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
          >
            {pending ? 'Subiendo...' : 'Subir imagen'}
          </button>
        </form>
      ) : (
        <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
          Debes iniciar sesión para subir imágenes.
        </div>
      )}

      <div>
        <h4 className="font-medium mb-2">Galería</h4>
        {mediaList?.length ? (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mediaList.map((m) => (
              <li key={m.id} className="border rounded p-2">
                <div className="aspect-square overflow-hidden rounded mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.public_url} alt="media" className="w-full h-full object-cover" />
                </div>
                {m.is_cover ? (
                  <div className="text-xs font-semibold text-emerald-700">✓ Portada</div>
                ) : (
                  <button
                    onClick={() => handleSetCover(m.id)}
                    disabled={pending || !canUpload}
                    className="text-xs px-2 py-1 rounded bg-gray-900 text-white disabled:opacity-50"
                  >
                    Marcar Portada
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">Sin imágenes aún.</div>
        )}
      </div>
    </div>
  );
}
