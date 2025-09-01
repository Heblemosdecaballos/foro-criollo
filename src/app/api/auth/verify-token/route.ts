
// API para verificar tokens JWT (para app móvil)
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
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
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token requerido" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verificar si es un token de Supabase o JWT personalizado
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    
    try {
      // Intentar verificar como JWT personalizado
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Validar que el usuario aún existe en Supabase
      const supabase = supabaseServer();
      const { data: { user }, error } = await supabase.auth.admin.getUserById(decoded.userId);
      
      if (error || !user) {
        return NextResponse.json(
          { success: false, error: "Usuario no válido" },
          { status: 401, headers: corsHeaders }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata
          }
        }
      }, { headers: corsHeaders });

    } catch (jwtError) {
      // Si falla JWT, intentar como token de Supabase
      const supabase = supabaseServer();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return NextResponse.json(
          { success: false, error: "Token inválido" },
          { status: 401, headers: corsHeaders }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata
          }
        }
      }, { headers: corsHeaders });
    }

  } catch (error) {
    console.error("Verify token API error:", error);
    return NextResponse.json(
      { success: false, error: "Error verificando token" },
      { status: 500, headers: corsHeaders }
    );
  }
}
