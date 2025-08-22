"use client";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function LikeButton({
  storyId,
  initialCount = 0,
}: {
  storyId: string;
  initialCount?: number;
}) {
  const sb = supa();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [count, setCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLiked(false); return; }
      const { error } = await sb
        .from("story_likes")
        .select("*", { head: true, count: "exact" })
        .eq("story_id", storyId)
        .eq("user_id", user.id);
      setLiked(!error); // si no hubo error en head, hay fila o no; head no devuelve error aunque no exista.
      // head no dice si existe; hacemos alternativa:
      const { count: c } = await sb
        .from("story_likes")
        .select("*", { count: "exact", head: true })
        .eq("story_id", storyId);
      if (typeof c === "number") setCount(c);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  const label = useMemo(() => (liked ? "❤️" : "🤍"), [liked]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      const redirect = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth?redirect=${redirect}`;
      return;
    }
    try {
      if (liked) {
        await sb.from("story_likes").delete().eq("story_id", storyId).eq("user_id", user.id);
        setLiked(false);
        setCount((v) => Math.max(0, v - 1));
      } else {
        await sb.from("story_likes").insert({ story_id: storyId, user_id: user.id });
        setLiked(true);
        setCount((v) => v + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggle} disabled={loading}
      className="btn-outline text-sm flex items-center gap-2">
      <span className="text-lg leading-none">{label}</span>
      <span>Me gusta</span>
      <span className="opacity-70">({count})</span>
    </button>
  );
}
