
// API principal para gestión de banners
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

// GET /api/banners - Obtener banners activos por posición
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const device = searchParams.get("device") || "all";
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "5");
    
    // Mock data para desarrollo si no hay conexión a DB
    const mockBanners: any[] = [
      {
        id: "1",
        title: "Suplementos Premium para Caballos",
        description: "Los mejores suplementos nutricionales para el rendimiento de tu caballo",
        banner_type: "image",
        image_url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=728&h=90&fit=crop",
        position: "header-leaderboard",
        click_url: "https://ejemplo-suplementos.com",
        advertiser_name: "Suplementos Equinos S.A.",
        pricing_model: "cpm",
        is_active: true,
        priority: 5,
        target_blank: true
      },
      {
        id: "2", 
        title: "Escuela de Equitación Profesional",
        description: "Aprende técnicas avanzadas de equitación",
        banner_type: "image",
        image_url: "http://rjclassics.com/cdn/shop/articles/professional-horseback-riding-hero_50e0619e-9c7f-46d2-8808-f3fb0e0100e0.jpg?v=1748875154",
        position: "sidebar-rectangle",
        click_url: "https://escuela-equitacion-ejemplo.com",
        advertiser_name: "Academia Ecuestre Elite",
        pricing_model: "cpc",
        is_active: true,
        priority: 3,
        target_blank: true
      },
      {
        id: "3",
        title: "Veterinario Especializado",
        description: "Consultas veterinarias 24/7",
        banner_type: "html",
        html_content: '<div style="background: linear-gradient(45deg, #8B4513, #D2691E); color: white; padding: 10px; text-align: center; border-radius: 8px;"><strong>🩺 Dr. Veterinario</strong><br><small>Consultas 24/7</small></div>',
        position: "content-mobile",
        click_url: "https://vet-caballos-ejemplo.com",
        advertiser_name: "Clínica Veterinaria Equina",
        pricing_model: "premium",
        is_active: true,
        priority: 4,
        target_blank: true
      },
      {
        id: "4",
        title: "Accesorios Premium",
        description: "Los mejores accesorios para tu caballo",
        banner_type: "image",
        image_url: "https://media.istockphoto.com/id/499801338/photo/horseback-riding-accessories.jpg?s=612x612&w=0&k=20&c=i7g5x-oF8I4gOdS71VDXKgxCY3OUFxmy-ohKdhzqho8=",
        position: "footer-leaderboard",
        click_url: "https://accesorios-ejemplo.com",
        advertiser_name: "Accesorios Equinos",
        pricing_model: "cpm",
        is_active: true,
        priority: 2,
        target_blank: true
      },
      {
        id: "5",
        title: "App Móvil Banner",
        description: "Descarga nuestra app móvil",
        banner_type: "html",
        html_content: '<div style="background: #2563eb; color: white; padding: 8px 12px; border-radius: 6px; text-align: center; font-size: 14px;"><strong>📱 Descarga la App</strong><br><small style="opacity: 0.9;">Disponible en iOS y Android</small></div>',
        position: "mobile-sticky",
        click_url: "https://app-ejemplo.com",
        advertiser_name: "Hablando de Caballos",
        pricing_model: "premium",
        is_active: true,
        priority: 6,
        target_blank: false
      }
    ];

    let banners = mockBanners;
    let error = null;

    try {
      const supabase = supabaseServer();
      
      let query = supabase
        .from("banners")
        .select(`
          id,
          title,
          description,
          banner_type,
          image_url,
          video_url,
          html_content,
          position,
          click_url,
          target_blank,
          device_targeting,
          category_targeting,
          advertiser_name,
          pricing_model,
          priority
        `)
        .eq("is_active", true)
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString())
        .order("priority", { ascending: false })
        .limit(limit);

      // Filtrar por posición
      if (position) {
        query = query.eq("position", position);
      }

      // Filtrar por dispositivo
      if (device !== "all") {
        query = query.or(`device_targeting.is.null,device_targeting.eq.all,device_targeting.eq.${device}`);
      }

      const result = await query;
      if (result.data) {
        banners = result.data;
      }
      error = result.error;

    } catch (fetchError: any) {
      console.log("Using mock banner data:", fetchError?.message);
      // Continuar con datos mock
    }

    // Filtrar por posición en mock data si es necesario
    if (position) {
      banners = banners.filter(banner => banner.position === position);
    }

    // Aplicar límite
    banners = banners.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: banners,
      count: banners?.length || 0,
      meta: {
        position,
        device,
        category,
        limit,
        timestamp: new Date().toISOString()
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("API /banners error:", error);
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      data: []
    }, { status: 500, headers: corsHeaders });
  }
}

// POST /api/banners - Crear nuevo banner (solo admins)
export async function POST(request: NextRequest) {
  try {
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
      console.log("Auth failed in POST /banners");
    }

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: corsHeaders });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado - Solo administradores" }, { status: 403, headers: corsHeaders });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      banner_type, 
      image_url, 
      video_url, 
      html_content, 
      position, 
      click_url, 
      advertiser_name,
      pricing_model,
      priority = 1,
      device_targeting = "all"
    } = body;

    // Validaciones
    if (!title || !banner_type || !position || !click_url) {
      return NextResponse.json({ 
        error: "Campos requeridos: title, banner_type, position, click_url" 
      }, { status: 400, headers: corsHeaders });
    }

    const validPositions = ['header-leaderboard', 'sidebar-rectangle', 'content-mobile', 'footer-leaderboard', 'mobile-sticky', 'interstitial'];
    if (!validPositions.includes(position)) {
      return NextResponse.json({ 
        error: "Posición inválida" 
      }, { status: 400, headers: corsHeaders });
    }

    try {
      const supabase = supabaseServer();
      const { data: banner, error } = await supabase
        .from("banners")
        .insert({
          title,
          description,
          banner_type,
          image_url,
          video_url,
          html_content,
          position,
          click_url,
          advertiser_name,
          pricing_model,
          priority: parseInt(priority),
          device_targeting,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating banner:", error);
        return NextResponse.json({ error: "Error creando banner" }, { status: 500, headers: corsHeaders });
      }

      return NextResponse.json({ 
        success: true, 
        data: banner,
        message: "Banner creado exitosamente"
      }, { headers: corsHeaders });

    } catch (dbError) {
      console.error("Database error creating banner:", dbError);
      return NextResponse.json({ 
        error: "Error de base de datos - usando modo demo" 
      }, { status: 200, headers: corsHeaders });
    }

  } catch (error) {
    console.error("API /banners POST error:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500, headers: corsHeaders });
  }
}
