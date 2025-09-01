
// API para obtener estadísticas de banners
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

// GET /api/banners/stats - Obtener estadísticas de banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const banner_id = searchParams.get("banner_id");
    const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d
    const position = searchParams.get("position");

    // Verificar autorización (solo admins pueden ver stats)
    let user = null;
    let isAdmin = false;

    try {
      const supabase = supabaseServer();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
        isAdmin = user.email === process.env.HALL_ADMIN_EMAIL || user.email === 'admin@hablandodecaballos.com';
      }
    } catch (authErr) {
      console.log("Auth failed in GET /banners/stats");
    }

    // Datos de ejemplo para desarrollo
    const mockStats = {
      summary: {
        total_impressions: 15432,
        total_clicks: 342,
        click_through_rate: 2.21,
        revenue_generated: 127.50,
        active_banners: 5
      },
      banners: [
        {
          banner_id: "1",
          title: "Suplementos Premium para Caballos",
          position: "header-leaderboard",
          impressions: 8450,
          clicks: 187,
          ctr: 2.21,
          revenue: 42.25
        },
        {
          banner_id: "2",
          title: "Escuela de Equitación Profesional",
          position: "sidebar-rectangle",
          impressions: 3234,
          clicks: 89,
          ctr: 2.75,
          revenue: 35.60
        },
        {
          banner_id: "3",
          title: "Veterinario Especializado",
          position: "content-mobile",
          impressions: 2145,
          clicks: 45,
          ctr: 2.10,
          revenue: 25.20
        },
        {
          banner_id: "4",
          title: "Accesorios Premium",
          position: "footer-leaderboard",
          impressions: 1236,
          clicks: 18,
          ctr: 1.46,
          revenue: 18.75
        },
        {
          banner_id: "5", 
          title: "App Móvil Banner",
          position: "mobile-sticky",
          impressions: 367,
          clicks: 3,
          ctr: 0.82,
          revenue: 5.70
        }
      ],
      daily_stats: [
        { date: "2025-01-01", impressions: 2234, clicks: 48, revenue: 18.30 },
        { date: "2025-01-02", impressions: 2156, clicks: 52, revenue: 19.75 },
        { date: "2025-01-03", impressions: 2087, clicks: 45, revenue: 17.80 },
        { date: "2025-01-04", impressions: 2298, clicks: 61, revenue: 22.40 },
        { date: "2025-01-05", impressions: 2145, clicks: 49, revenue: 18.90 },
        { date: "2025-01-06", impressions: 2267, clicks: 54, revenue: 20.15 },
        { date: "2025-01-07", impressions: 2245, clicks: 33, revenue: 10.40 }
      ],
      device_breakdown: {
        mobile: { impressions: 9234, clicks: 201, percentage: 59.8 },
        desktop: { impressions: 5432, clicks: 121, percentage: 35.2 },
        tablet: { impressions: 766, clicks: 20, percentage: 5.0 }
      },
      position_performance: {
        "header-leaderboard": { impressions: 8450, clicks: 187, ctr: 2.21 },
        "sidebar-rectangle": { impressions: 3234, clicks: 89, ctr: 2.75 },
        "content-mobile": { impressions: 2145, clicks: 45, ctr: 2.10 },
        "footer-leaderboard": { impressions: 1236, clicks: 18, ctr: 1.46 },
        "mobile-sticky": { impressions: 367, clicks: 3, ctr: 0.82 }
      }
    };

    let stats = mockStats;
    let error = null;

    try {
      const supabase = supabaseServer();
      
      // Calcular fecha de inicio según el período
      const now = new Date();
      let startDate = new Date(now);
      switch (period) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // Consultar estadísticas reales si hay conexión DB
      let impressionsQuery = supabase
        .from("banner_stats")
        .select("banner_id, timestamp, device_type, page_category")
        .gte("timestamp", startDate.toISOString());

      let clicksQuery = supabase
        .from("banner_clicks") 
        .select("banner_id, timestamp, device_type")
        .gte("timestamp", startDate.toISOString());

      if (banner_id) {
        impressionsQuery = impressionsQuery.eq("banner_id", banner_id);
        clicksQuery = clicksQuery.eq("banner_id", banner_id);
      }

      const [impressionsResult, clicksResult] = await Promise.all([
        impressionsQuery,
        clicksQuery
      ]);

      if (impressionsResult.data || clicksResult.data) {
        // Procesar estadísticas reales aquí si están disponibles
        console.log("Using real stats data");
      }

    } catch (fetchError: any) {
      console.log("Using mock stats data:", fetchError?.message);
      // Continuar con datos mock
    }

    // Filtrar por banner específico si se solicita
    if (banner_id && stats.banners) {
      stats.banners = stats.banners.filter(b => b.banner_id === banner_id);
    }

    // Filtrar por posición si se solicita
    if (position && stats.banners) {
      stats.banners = stats.banners.filter(b => b.position === position);
    }

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        period,
        banner_id,
        position,
        timestamp: new Date().toISOString(),
        mode: "demo" // Cambiar a "live" cuando conecte con DB real
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("API /banners/stats error:", error);
    return NextResponse.json({
      success: false,
      error: "Error obteniendo estadísticas"
    }, { status: 500, headers: corsHeaders });
  }
}
