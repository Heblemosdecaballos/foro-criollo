'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { toggleVote } from './actions';

export default function VoteButton({
  profileId,
  slug,
  count,
}: {
  profileId: string;
  slug: string;
  count: number;
}) {
  const [pending, start] = useTransition();

  async function handleClick() {
    const fd = new FormData();
    fd.set('profileId', profileId);
    fd.set('slug', slug);

    start(async () => {
      await toggleVote(fd);
    });
  }

  return (
    <button
      disabled={pending}
      onClick={handleClick}
      className="btn btn-success"
    >
      {pending ? 'Votando…' : `Votar (${count})`}
    </button>
  );
}
