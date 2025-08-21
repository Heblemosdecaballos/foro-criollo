// /app/hall/[slug]/AddMediaForm.tsx
'use client';

import { useRef, useTransition } from 'react';
import { addMediaAction } from './actions';

type Props = {
  profileId: string;
  slug: string;
};

export default function AddMediaForm({ profileId, slug }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  // Esta función se asigna al action del <form>, recibe automáticamente el FormData
  const onAction = (fd: FormData) => {
    startTransition(async () => {
      await addMediaAction({ profileId, slug }, fd);
      ref.current?.reset();
    });
  };

  return (
    <form
      ref={ref}
      action={onAction}
      className="space-y-3"
      encType="multipart/form-data"
    >
      <input
        required
        name="file"
        type="file"
        accept="image/*,video/*"
        className="block"
      />
      <input
        name="caption"
        type="text"
        placeholder="Leyenda (opcional)"
        className="w-full rounded-md border p-2"
      />
      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending ? 'Subiendo…' : 'Subir archivo'}
      </button>
    </form>
  );
}
