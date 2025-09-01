
// API de health check para monitoreo
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  try {
    // Test conexión a Supabase
    const supabase = supabaseServer();
    const { data, error } = await supabase.from("hall_horses").select("count", { count: "exact" });
    
    const dbStatus = error ? "error" : "ok";
    
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.2.0",
      services: {
        database: dbStatus,
        hall_horses_count: data?.[0]?.count || 0
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      version: "1.2.0",
      error: "Service unavailable"
    }, { status: 500, headers: corsHeaders });
  }
}
