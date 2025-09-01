
// API para upload de archivos multimedia para banners
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

// POST /api/banners/upload - Subir archivo para banner
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización
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
      console.log("Auth failed in POST /banners/upload");
    }

    if (!user) {
      return NextResponse.json({ 
        error: "No autenticado" 
      }, { status: 401, headers: corsHeaders });
    }

    if (!isAdmin) {
      return NextResponse.json({ 
        error: "No autorizado - Solo administradores" 
      }, { status: 403, headers: corsHeaders });
    }

    // Obtener archivo del FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "banners";

    if (!file) {
      return NextResponse.json({ 
        error: "No se encontró archivo" 
      }, { status: 400, headers: corsHeaders });
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Tipo de archivo no permitido. Use: JPG, PNG, WebP, GIF, MP4, WebM" 
      }, { status: 400, headers: corsHeaders });
    }

    // Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "Archivo muy grande. Máximo 10MB" 
      }, { status: 400, headers: corsHeaders });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'unknown';
    const filename = `${folder}/${timestamp}_${randomStr}.${extension}`;

    try {
      // En un entorno real, subiríamos a Supabase Storage
      // const supabase = supabaseServer();
      // const { data, error } = await supabase.storage
      //   .from('banner-uploads')
      //   .upload(filename, file);

      // Por ahora, simulamos upload exitoso
      const mockUploadUrl = `https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&h=400&fit=crop`;
      
      return NextResponse.json({
        success: true,
        data: {
          filename,
          url: mockUploadUrl,
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString()
        },
        message: "Archivo subido exitosamente (modo demo)"
      }, { headers: corsHeaders });

    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      
      // Fallback: devolver URL de ejemplo
      const fallbackUrl = file.type.startsWith('image/') 
        ? 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&h=400&fit=crop'
        : 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';

      return NextResponse.json({
        success: true,
        data: {
          filename,
          url: fallbackUrl,
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString()
        },
        message: "Modo demo - usando URL de ejemplo"
      }, { headers: corsHeaders });
    }

  } catch (error) {
    console.error("API /banners/upload error:", error);
    return NextResponse.json({
      success: false,
      error: "Error en upload"
    }, { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/banners/upload - Eliminar archivo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ 
        error: "Filename requerido" 
      }, { status: 400, headers: corsHeaders });
    }

    // Verificar autorización
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
      console.log("Auth failed in DELETE /banners/upload");
    }

    if (!user || !isAdmin) {
      return NextResponse.json({ 
        error: "No autorizado" 
      }, { status: 403, headers: corsHeaders });
    }

    try {
      // En un entorno real, eliminaríamos de Supabase Storage
      // const supabase = supabaseServer();
      // const { error } = await supabase.storage
      //   .from('banner-uploads')
      //   .remove([filename]);

      return NextResponse.json({
        success: true,
        message: "Archivo eliminado exitosamente (modo demo)"
      }, { headers: corsHeaders });

    } catch (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json({
        success: false,
        error: "Error eliminando archivo"
      }, { status: 500, headers: corsHeaders });
    }

  } catch (error) {
    console.error("API /banners/upload DELETE error:", error);
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor"
    }, { status: 500, headers: corsHeaders });
  }
}
