"use client";

import { useState, useTransition } from "react";
import { followAction, unfollowAction, voteAction, commentAction, setFeaturedMediaAction, deleteMediaAction } from "./actions";

/* ======== VOTO ======== */
export function VoteButton({ horseId }: { horseId: string }) {
  const [pending, start] = useTransition();
  const [count, setCount] = useState<number | null>(null);

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await voteAction(horseId);
          if (res.ok && typeof res.votes_count === "number") setCount(res.votes_count);
        })
      }
      className="rounded-full border px-3 py-1 text-sm bg-white/70 hover:bg-white"
    >
      👍 Votar {count !== null ? `(${count})` : ""}
    </button>
  );
}

/* ======== FOLLOW ======== */
export function FollowButton({ horseId }: { horseId: string }) {
  const [following, setFollowing] = useState(false);
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = following ? await unfollowAction(horseId) : await followAction(horseId);
          if (res.ok) setFollowing(!following);
        })
      }
      className="rounded-full border px-3 py-1 text-sm bg-white/70 hover:bg-white"
    >
      {following ? "✓ Siguiendo" : "Seguir"}
    </button>
  );
}

/* ======== COMENTARIOS ======== */
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
        onChange={(e) => setValue(e.target.value)}
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
  return (
    <div className="mt-3">
      <CommentForm targetType="media" targetId={mediaId} />
    </div>
  );
}

/* ======== ACCIONES DE ADMIN SOBRE MEDIA ======== */
export function AdminMediaActions({
  horseId,
  mediaId,
  onDone,
}: {
  horseId: string;
  mediaId: string;
  onDone?: () => void;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-2 mt-2">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setFeaturedMediaAction(horseId, mediaId);
            onDone?.();
            if (!res.ok) alert(res.message || "No se pudo establecer portada");
          })
        }
        className="text-xs rounded border px-2 py-1 bg-white hover:bg-amber-50"
      >
        ⭐ Portada
      </button>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const ok = confirm("¿Eliminar archivo?");
            if (!ok) return;
            const res = await deleteMediaAction(mediaId);
            onDone?.();
            if (!res.ok) alert(res.message || "No se pudo eliminar");
          })
        }
        className="text-xs rounded border px-2 py-1 bg-white hover:bg-red-50"
      >
        🗑️ Eliminar
      </button>
    </div>
  );
}
