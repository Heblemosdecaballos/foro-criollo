// /src/app/admin/hall/[slug]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { notFound } from "next/navigation";
import { addYouTubeAction, uploadImageAction } from "./actions";

type Props = { params: { slug: string } };

/** Cliente Supabase local para Server Components (sin alias externos) */
function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function AdminHallPage({ params }: Props) {
  const { slug } = params;
  const supabase = createSupabaseServer();

  const { data: entry, error: entryErr } = await supabase
    .from("hall_entries")
    .select("id, slug, title, andar")
    .eq("slug", slug)
    .maybeSingle();
  if (en
