// components/ads/AdSlot.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type Props = { slot: string; className?: string };

function supa() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get(n: string) { return cookieStore.get(n)?.value; },
      set(n: string, v: string, o: any) { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
      remove(n: string, o: any) { try { cookieStore.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

export default async function AdSlot({ slot, className = "" }: Props) {
  const supabase = supa();
  const now = new Date().toISOString();
  const { data: ad } = await supabase
    .from("ads")
    .select("image_url,link_url,html")
    .eq("slot", slot)
    .eq("active", true)
    .or("start_at.is.null,start_at.lte." + now)
    .or("end_at.is.null,end_at.gte." + now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!ad) return null;

  if (ad.html) {
    // Ad HTML (AdSense/GAM). Ojo: confía solo en HTML propio.
    return (
      <div className={className}
        dangerouslySetInnerHTML={{ __html: ad.html }}
      />
    );
  }

  if (ad.image_url && ad.link_url) {
    return (
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.image_url} alt="Publicidad" className="mx-auto h-auto w-full rounded" />
      </a>
    );
  }

  return null;
}
