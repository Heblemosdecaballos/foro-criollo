
// API de login unificada para web y móvil
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// CORS headers para permitir acceso desde app móvil
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
    const { email, password, platform } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email y contraseña requeridos" },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = supabaseServer();
    
    // Intentar login con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401, headers: corsHeaders }
      );
    }

    // Crear JWT para app móvil si es necesario
    let customJwt = null;
    if (platform === 'mobile') {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      customJwt = jwt.sign(
        {
          userId: data.user.id,
          email: data.user.email,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 días
        },
        jwtSecret
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at
        },
        custom_jwt: customJwt
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500, headers: corsHeaders }
    );
  }
}
