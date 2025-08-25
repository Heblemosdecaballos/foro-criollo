"use client";

import { useOptimistic, useTransition } from "react";
import { toggleVote } from "./actions";

export default function VoteButton({
  slug,
  mediaId,
  initialVotes,
}: {
  slug: string;
  mediaId?: string | null;
  initialVotes: number;
}) {
  const [pending, startTransition] = useTransition();
  const [votes, setVotes] = useOptimistic(initialVotes, (v) => v);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await toggleVote(slug, mediaId || undefined);
          if (res.ok) setVotes(res.votes);
          // si falla, podrías mostrar un toast fuera del botón
        });
      }}
      className="rounded border border-black/20 px-3 py-1 text-sm hover:bg-black/5 disabled:opacity-60"
    >
      👍 {votes}
