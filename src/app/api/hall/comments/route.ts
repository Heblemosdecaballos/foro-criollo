

// API para comentarios del Hall of Fame
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/hall/comments?horse_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horse_id = searchParams.get("horse_id");

    if (!horse_id) {
      return NextResponse.json({ error: "horse_id requerido" }, { status: 400 });
    }

    let comments: any[] = [];
    
    try {
      const supabase = supabaseServer();
      
      const { data, error } = await supabase
        .from("hall_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          auth.users!user_id(email)
        `)
        .eq("horse_id", horse_id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        comments = data;
      }
    } catch (fetchError: any) {
      console.error("Error fetching comments:", {
        message: fetchError?.message || 'Unknown error',
        details: fetchError?.stack || fetchError,
        hint: 'Check Supabase configuration',
        code: fetchError?.code || ''
      });
      
      // Return empty comments for development
      comments = [];
    }

    return NextResponse.json({
      success: true,
      data: comments,
      count: comments?.length || 0
    });
  } catch (error) {
    console.error("API /hall/comments GET error:", error);
    return NextResponse.json({ 
      success: true, 
      data: [], 
      count: 0 
    }, { status: 200 });
  }
}

// POST /api/hall/comments - Crear comentario
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
      console.log("Auth failed in POST /hall/comments");
    }

    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para comentar" }, { status: 401 });
    }

    const body = await request.json();
    const { horse_id, content } = body;

    if (!horse_id || !content?.trim()) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    try {
      const supabase = supabaseServer();
      const { data: comment, error } = await supabase
        .from("hall_comments")
        .insert({
          horse_id,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          auth.users!user_id(email)
        `)
        .single();

      if (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Error creando comentario" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: comment
      });
    } catch (dbError) {
      console.error("Database error creating comment:", dbError);
      return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
    }
  } catch (error) {
    console.error("API /hall/comments POST error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
