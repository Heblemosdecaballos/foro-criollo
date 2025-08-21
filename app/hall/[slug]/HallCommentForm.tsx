'use client';

import { useTransition } from 'react';
import { addHallComment } from './actions';

export default function HallCommentForm({ profileId, slug, viewerName }: { profileId: string; slug: string; viewerName?: string | null }) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(formData) => start(() => addHallComment(formData))}
      className="space-y-2"
    >
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      <textarea
        name="content"
        placeholder={`Escribe un comentario…${viewerName ? `, ${viewerName}` : ''}`}
        className="textarea textarea-bordered w-full"
        required
      />
      <button disabled={pending} className="btn btn-success">
        {pending ? 'Comentando…' : 'Comentar'}
      </button>
    </form>
  );
}
