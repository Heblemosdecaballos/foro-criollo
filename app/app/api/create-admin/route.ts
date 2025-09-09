
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

// ✅ API REFACTORIZADA CON NUEVA ARQUITECTURA

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()
    
    console.log('🔧 Creando usuario con nueva arquitectura admin:', email)
    
    // ✅ Usar cliente admin centralizado
    const supabaseAdmin = createAdminSupabaseClient()

    // Crear usuario usando admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        name,
        role,
        created_via: 'admin_api',
        created_at: new Date().toISOString()
      }
    })

    if (error) {
      console.error('❌ Error creando usuario:', error)
      
      // Manejar errores específicos
      if (error.message.includes('User already registered')) {
        return NextResponse.json({ 
          success: true, // Considerarlo éxito si ya existe
          message: `✅ El usuario ${email} ya existe y está listo para usar`,
          user: { email }
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    console.log('✅ Usuario creado exitosamente:', data.user?.email)

    return NextResponse.json({ 
      success: true, 
      message: `✅ Usuario ${role} creado exitosamente`,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role: data.user?.user_metadata?.role
      }
    })

  } catch (error: any) {
    console.error('❌ Error crítico en la API:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Error del servidor: ${error.message}` 
    }, { status: 500 })
  }
}
