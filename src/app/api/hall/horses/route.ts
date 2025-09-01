

// API para obtener caballos del Hall of Fame
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isValidAndar } from "@/lib/hall/utils";

export const dynamic = "force-dynamic";

// GET /api/hall/horses?andar=trocha-y-galope
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const andar = searchParams.get("andar");
    
    if (andar && !isValidAndar(andar)) {
      return NextResponse.json({ error: "Andar inválido" }, { status: 400 });
    }

    let horses = [];
    let error = null;

    try {
      const supabase = supabaseServer();
      
      let query = supabase
        .from("hall_horses")
        .select(`
          id,
          slug,
          name,
          andar_slug,
          description,
          pedigree_url,
          views,
          votes_count,
          created_at
        `)
        .order("name", { ascending: true });

      if (andar) {
        query = query.eq("andar_slug", andar);
      }

      const result = await query;
      horses = result.data || [];
      error = result.error;
    } catch (fetchError: any) {
      console.error("Error fetching horses:", {
        message: fetchError?.message || 'Unknown error',
        details: fetchError?.stack || fetchError,
        hint: 'Check Supabase configuration',
        code: fetchError?.code || ''
      });
      
      // Return mock data for development
      horses = [
        {
          id: "1",
          slug: "demo-horse",
          name: "Caballo Demo",
          andar_slug: andar || "trocha-y-galope",
          description: "Caballo de demostración",
          pedigree_url: null,
          views: 0,
          votes_count: 0,
          created_at: new Date().toISOString()
        }
      ];
    }

    return NextResponse.json({
      success: true,
      data: horses,
      count: horses?.length || 0
    });
  } catch (error) {
    console.error("API /hall/horses error:", error);
    return NextResponse.json({ 
      success: true, 
      data: [], 
      count: 0 
    }, { status: 200 });
  }
}

// POST /api/hall/horses - Crear nuevo caballo (solo admins)
export async function POST(request: NextRequest) {
  try {
    let user = null;
    try {
      const supabase = supabaseServer();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
      }
    } catch (authErr) {
      console.log("Auth failed in POST /hall/horses");
    }

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar si es admin (puedes ajustar esta lógica)
    const isAdmin = user.email === process.env.HALL_ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, andar_slug, description, pedigree_url } = body;

    if (!name || !andar_slug || !isValidAndar(andar_slug)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Crear slug
    const slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    try {
      const supabase = supabaseServer();
      const { data: horse, error } = await supabase
        .from("hall_horses")
        .insert({
          name,
          slug,
          andar_slug,
          description,
          pedigree_url,
          views: 0,
          votes_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating horse:", error);
        return NextResponse.json({ error: "Error creando caballo" }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: horse });
    } catch (dbError) {
      console.error("Database error creating horse:", dbError);
      return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
    }
  } catch (error) {
    console.error("API /hall/horses POST error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
