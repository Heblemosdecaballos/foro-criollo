
// API de registro unificada para web y móvil
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = supabaseServer();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name }
      }
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuario registrado exitosamente. Revisa tu email para confirmar la cuenta.",
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          user_metadata: data.user?.user_metadata
        }
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500, headers: corsHeaders }
    );
  }
}
