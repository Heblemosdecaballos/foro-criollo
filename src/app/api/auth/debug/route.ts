import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function GET() {
  const supa = createSupabaseServerClient();
  const { data: sessionData } = await supa.auth.getSession();
  const { data: userData } = await supa.auth.getUser();
  return NextResponse.json({
    hasSession: !!sessionData?.session,
    user: userData?.user || null,
  });
}
