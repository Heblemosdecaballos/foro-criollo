import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ThreadLegacyById({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: t } = await supabase
    .from("threads")
    .select("slug, is_deleted")
    .eq("id", params.id)
    .single();

  if (!t || t.is_deleted) notFound();
  redirect(`/foros/${t.slug}`);
}
