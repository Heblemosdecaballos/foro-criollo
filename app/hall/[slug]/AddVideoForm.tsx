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

  return (
    <form
      action={(formData) => start(() => addYoutubeAction(formData))}
      className="space-y-3"
    >
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      <input
        name="url"
        type="url"
        required
        placeholder="URL de YouTube (ej. https://youtu.be/XXXXXXXXXXX)"
        className="input w-full"
      />

      <input
        name="caption"
        type="text"
        placeholder="Leyenda (opcional)"
        className="input w-full"
      />

      <button type="submit" disabled={pending} className="btn btn-success">
        {pending ? 'Agregando…' : 'Agregar video'}
      </button>
    </form>
  );
}
