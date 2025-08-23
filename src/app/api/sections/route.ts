import { NextResponse } from "next/server";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export async function GET() {
  const supa = createSupabaseServerClientReadOnly();
  const { data, error } = await supa.from("sections").select("*").order("title");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ sections: data });
}
