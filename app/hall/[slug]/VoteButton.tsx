'use client';

import { useTransition } from 'react';
import { toggleVote } from './actions';

export default function VoteButton({ profileId, slug, count = 0 }: { profileId: string; slug: string; count?: number }) {
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => start(() => toggleVote(profileId, slug))}
      className="btn btn-success"
    >
      {pending ? 'Votando…' : `Votar (${count})`}
    </button>
  );
}
