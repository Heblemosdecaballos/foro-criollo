'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { addMediaAction } from './actions';

type Props = {
  profileId: string;
  slug: string;
};

export default function AddMediaForm({ profileId, slug }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<boolean>(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    // Asegurar que viajan estos campos
    fd.set('profileId', profileId);
    fd.set('slug', slug);

    startTransition(async () => {
      const res = await addMediaAction(fd);
      if (res?.ok) {
        setOk(true);
        formEl.reset(); // limpiar inputs
      } else {
        setError(res?.error ?? 'No se pudo subir el archivo');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="file"
          name="file"
          required
          accept="image/*,video/*"
          className="input"
        />
        <input
          type="text"
          name="caption"
          placeholder="Leyenda (opcional)"
          className="input"
        />
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Subiendo…' : 'Subir foto'}
        </button>
      </div>

      {ok && <p className="text-green-600 text-sm">¡Archivo subido!</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
