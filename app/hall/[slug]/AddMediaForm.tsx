'use client';

import { useTransition } from 'react';
import { addMediaAction } from './actions';

export default function AddMediaForm({ profileId, slug }: { profileId: string; slug: string }) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(formData) => start(() => addMediaAction(formData))}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      <input type="file" name="file" accept="image/*" required />
      <input type="text" name="caption" placeholder="Leyenda (opcional)" className="input input-bordered" />

      <button disabled={pending} className="btn btn-primary">
        {pending ? 'Subiendo…' : 'Subir foto'}
      </button>
    </form>
  );
}
