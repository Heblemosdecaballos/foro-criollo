"use client";

import { useState, useTransition } from "react";
import { followAction, unfollowAction, voteAction, commentAction } from "./actions";

export function VoteButton({ horseId }: { horseId: string }) {
  const [pending, start] = useTransition();
  const [count, setCount] = useState<number | null>(null);

  return (
    <button
      disabled={pending}
      onClick={() => start(async () => {
        const res = await voteAction(horseId);
        if (res.ok && typeof res.votes_count === "number") setCount(res.votes_count);
      })}
      className="rounded-full border px-3 py-1 text-sm bg-white/70 hover:bg-white"
    >
      👍 Votar {count !== null ? `(${count})` : ""}
    </button>
  );
}

export function FollowButton({ horseId }: { horseId: string }) {
  const [following, setFollowing] = useState(false);
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => start(async () => {
        const res = following ? await unfollowAction(horseId) : await followAction(horseId);
        if (res.ok) setFollowing(!following);
      })}
      className="rounded-full border px-3 py-1 text-sm bg-white/70 hover:bg-white"
    >
      {following ? "✓ Siguiendo" : "Seguir"}
    </button>
  );
}

export function CommentForm({ targetType, targetId }: { targetType: "horse" | "media"; targetId: string }) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          if (!value.trim()) return;
          const res = await commentAction(targetType, targetId, value.trim());
          if (res.ok) setValue("");
        });
      }}
      className="flex gap-2"
    >
      <input
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        placeholder="Escribe un comentario…"
        className="flex-1 rounded border px-3 py-2"
      />
      <button disabled={pending} className="rounded bg-green-700 text-white px-4 py-2">
        Publicar
      </button>
    </form>
  );
}

export function MediaComments({ mediaId }: { mediaId: string }) {
  // (Opcional) aquí puedes listar comentarios por media si lo deseas.
  // Para no alargar, dejamos solo el formulario:
  return (
    <div className="mt-3">
      <CommentForm targetType="media" targetId={mediaId} />
    </div>
  );
}
