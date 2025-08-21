'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { addHallComment } from './actions';

export default function HallCommentForm({
  profileId,
  slug,
  viewerName,
}: {
  profileId: string;
  slug: string;
  viewerName?: string | null;
}) {
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    fd.set('profileId', profileId);
    fd.set('slug', slug);

    start(async () => {
      await addHallComment(fd);
      form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      <textarea
        name="content"
        placeholder={`Escribe un comentario…${
          viewerName ? `, ${viewerName}` : ''
        }`}
        className="textarea textarea-bordered w-full"
        required
      />

      <button type="submit" disabled={pending} className="btn btn-success">
        {pending ? 'Comentando…' : 'Comentar'}
      </button>
    </form>
  );
}
