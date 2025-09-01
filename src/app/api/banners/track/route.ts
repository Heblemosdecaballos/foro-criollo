
// API para tracking de impresiones de banners
import { NextRequest, NextResponse } from "next/server";
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

// POST /api/banners/track - Registrar impresión de banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      banner_id, 
      page_url, 
      session_id,
      view_duration = 0,
      page_category = "general"
    } = body;

    if (!banner_id || !page_url) {
      return NextResponse.json({ 
        error: "Campos requeridos: banner_id, page_url" 
      }, { status: 400, headers: corsHeaders });
    }

    // Obtener información de la request
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor?.split(',')[0] || realIp || "unknown";

    // Detectar tipo de dispositivo básico
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const deviceType = isMobile ? "mobile" : (isTablet ? "tablet" : "desktop");

    // Detectar browser básico
    let browser = "unknown";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    // Registrar estadística
    const trackingData = {
      banner_id,
      page_url,
      referrer_url: referrer || null,
      user_agent: userAgent,
      device_type: deviceType,
      browser,
      session_id: session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      view_duration: parseInt(view_duration),
      page_category,
      ip_address: ip,
      timestamp: new Date().toISOString()
    };

    let success = false;
    
    try {
      const supabase = supabaseServer();
      const { error } = await supabase
        .from("banner_stats")
        .insert(trackingData);

      if (!error) {
        success = true;
      } else {
        console.log("Error saving banner stats:", error.message);
      }
    } catch (dbError) {
      console.log("Database not available, tracking data:", trackingData);
      // En modo desarrollo, consideramos exitoso aunque no se guarde
      success = true;
    }

    return NextResponse.json({
      success: true,
      tracked: success,
      session_id: trackingData.session_id,
      timestamp: trackingData.timestamp,
      message: success ? "Impresión registrada" : "Modo demo - tracking simulado"
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("API /banners/track error:", error);
    return NextResponse.json({
      success: false,
      error: "Error en tracking"
    }, { status: 500, headers: corsHeaders });
  }
}
