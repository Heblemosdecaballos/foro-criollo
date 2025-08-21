// /app/hall/[slug]/AddVideoForm.tsx
'use client';

import { useRef, useTransition } from 'react';
import { addYoutubeAction } from './actions';

type Props = {
  profileId: string;
  slug: string;
};

export default function AddVideoForm({ profileId, slug }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const onAction = (fd: FormData) => {
    startTransition(async () => {
      await addYoutubeAction({ profileId, slug }, fd);
      ref.current?.reset();
    });
  };

  return (
    <form ref={ref} action={onAction} className="space-y-3">
      <input
        name="youtube_url"
        type="url"
        placeholder="Pega la URL de YouTube (https://...)"
        required
        className="w-full rounded-md border p-2"
      />
      <input
        name="caption"
        type="text"
        placeholder="Leyenda (opcional)"
        className="w-full rounded-md border p-2"
      />
      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending ? 'Agregando…' : 'Agregar video'}
      </button>
    </form>
  );
}
