
// API para operaciones específicas de caballos del Hall of Fame
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/hall/horses/[id] - Obtener caballo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();
    
    const { data: horse, error } = await supabase
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
      .eq("id", params.id)
      .single();

    if (error || !horse) {
      return NextResponse.json({ error: "Caballo no encontrado" }, { status: 404 });
    }

    // Incrementar views
    await supabase
      .from("hall_horses")
      .update({ views: horse.views + 1 })
      .eq("id", params.id);

    // Obtener media asociado
    const { data: media } = await supabase
      .from("hall_media")
      .select("*")
      .eq("horse_id", params.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        ...horse,
        views: horse.views + 1,
        media: media || []
      }
    });
  } catch (error) {
    console.error("API /hall/horses/[id] error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT /api/hall/horses/[id] - Actualizar caballo (solo admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const isAdmin = user.email === process.env.HALL_ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, pedigree_url } = body;

    const { data: horse, error } = await supabase
      .from("hall_horses")
      .update({
        name,
        description,
        pedigree_url
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Error actualizando caballo" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: horse });
  } catch (error) {
    console.error("API /hall/horses/[id] PUT error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
