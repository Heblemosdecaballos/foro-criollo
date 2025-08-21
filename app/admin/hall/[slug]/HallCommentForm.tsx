// /app/hall/[slug]/HallCommentForm.tsx

'use client';

import { useState, useTransition } from 'react';

type Props = {
  profileId: string;
  viewerName?: string | null;
};

export default function HallCommentForm({ profileId, viewerName }: Props) {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState('');

  // ✅ Normalizamos el nombre para mostrar o para enviar
  const displayName = viewerName && viewerName.trim() ? viewerName : 'usuario';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      profileId,
      text: text.trim(),
      authorName: displayName, // lo enviamos ya normalizado
    };

    if (!payload.text) return;

    startTransition(async () => {
      try {
        // ⬇️ Sustituye esta llamada por tu action real si ya la tienes
        await fakeAddComment(payload);
        setText('');
      } catch (err) {
        console.error(err);
        alert('No se pudo guardar el comentario');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="text-xs text-muted">
        Comentando como <span className="font-medium">{displayName}</span>
      </div>

      <textarea
        className="w-full border rounded-md p-2"
        rows={3}
        placeholder="Escribe un comentario…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? 'Enviando…' : 'Comentar'}
      </button>
    </form>
  );
}

/** 
 * 🔧 Quita esto si ya tienes una server action real (p.ej., addHallComment)
 * y reemplaza la llamada en onSubmit por la tuya.
 */
async function fakeAddComment(_payload: { profileId: string; text: string; authorName: string }) {
  return new Promise((res) => setTimeout(res, 400));
}
