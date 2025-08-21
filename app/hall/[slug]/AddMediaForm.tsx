'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { addMediaAction } from './actions';

export default function AddMediaForm({
  profileId,
  slug,
}: {
  profileId: string;
  slug: string;
}) {
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Nos aseguramos de enviar los campos ocultos
    fd.set('profileId', profileId);
    fd.set('slug', slug);

    start(async () => {
      await addMediaAction(fd);
      form.reset(); // limpiar el formulario tras subir
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2"
      encType="multipart/form-data"
    >
      {/* Hidden para redundancia (también se setean en onSubmit) */}
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      <input type="file" name="file" accept="image/*" required />
      <input
        type="text"
        name="caption"
        placeholder="Leyenda (opcional)"
        className="input input-bordered"
      />

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? 'Subiendo…' : 'Subir foto'}
      </button>
    </form>
  );
}
