"use client";
import { useState, useTransition } from "react";
import { toggleVote } from "./actions";

type Props = {
  slug: string;
  initialCount?: number;
};

export default function VoteButton({ slug, initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      try {
        const res = await toggleVote(slug);
        if (res?.ok && typeof res.votes === "number") setCount(res.votes);
      } catch (e) {
        console.error(e);
        alert("No se pudo registrar tu voto.");
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="px-3 py-2 rounded bg-[var(--brand-green)] text-white disabled:opacity-60"
    >
      👍 {pending ? "..." : count}
    </button>
  );
}
