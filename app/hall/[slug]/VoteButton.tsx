'use client';

import { useState, useTransition } from 'react';
import { toggleVote } from './actions';

type Props = {
  profileId: string;
  slug: string;
  initialCount: number;
};

export default function VoteButton({ profileId, slug, initialCount }: Props) {
  const [pending, startTransition] = useTransition();
  const [count, setCount] = useState<number>(initialCount ?? 0);

  const onClick = () => {
    startTransition(async () => {
      const res = await toggleVote(profileId, slug);
      if (res?.ok && typeof res.votes === 'number') {
        setCount(res.votes);
      }
    });
  };

  return (
    <button
      type="button"
      className="btn btn-success"
      disabled={pending}
      onClick={onClick}
    >
      {pending ? 'Votando…' : `Votar (${count})`}
    </button>
  );
}
