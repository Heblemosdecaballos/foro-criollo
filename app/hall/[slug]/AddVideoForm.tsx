'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { addYoutubeAction } from './actions';

export default function AddVideoForm({
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

    fd.set('profileId', profileId);
    fd.set('slug', slug);

    start(async () => {
      await addYoutubeAction(fd);
      form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      <input
        type="url"
        name="url"
        placeholder="URL de YouTube"
        className="input input-bordered"
        required
      />
      <input
        type="text"
        name="caption"
        placeholder="Leyenda (opcional)"
        className="input input-bordered"
      />

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? 'Agregando…' : 'Agregar video'}
      </button>
    </form>
  );
}
