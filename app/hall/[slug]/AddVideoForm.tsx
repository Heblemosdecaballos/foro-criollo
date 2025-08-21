'use client';

import { useTransition } from 'react';
import { addYoutubeAction } from './actions';

export default function AddVideoForm({ profileId, slug }: { profileId: string; slug: string }) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(formData) => start(() => addYoutubeAction(formData))}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      <input type="url" name="url" placeholder="URL de YouTube" className="input input-bordered" required />
      <input type="text" name="caption" placeholder="Leyenda (opcional)" className="input input-bordered" />

      <button disabled={pending} className="btn btn-primary">
        {pending ? 'Agregando…' : 'Agregar video'}
      </button>
    </form>
  );
}
