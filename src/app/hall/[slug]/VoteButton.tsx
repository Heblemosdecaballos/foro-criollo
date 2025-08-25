"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { hallSlug: string; mediaId?: string | null };

export default function VoteButton({ hallSlug, mediaId = null }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/hall/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hall_slug: hallSlug, media_id: mediaId }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className="text-sm px-3 py-1 rounded-full border hover:bg-black hover:text-white transition"
    >
      {loading ? "..." : "👍 Votar"}
    </button>
  );
}
