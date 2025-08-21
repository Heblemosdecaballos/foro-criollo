// /app/hall/[slug]/HallCommentForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { addHallComment } from './actions';

type Props = {
  profileId: string;
  slug: string;
  viewerName?: string | null;
};

export default function HallCommentForm({ profileId, slug, viewerName }: Props) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    startTransition(async () => {
      await addHallComment({ profileId, slug, content: text });
      setContent('');
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm text-muted">
        Escribe un comentario{viewerName ? `, ${viewerName}` : ''}…
      </label>
      <textarea
        className="w-full rounded-md border p-3"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un comentario…"
      />
      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending ? 'Guardando…' : 'Comentar'}
      </button>
    </form>
  );
}
