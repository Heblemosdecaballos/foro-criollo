
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()
    
    // Usar el service role para crear usuarios sin confirmación de email
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!, // Service role key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Creando usuario con service role:', email)

    // Crear usuario usando admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        name,
        role
      }
    })

    if (error) {
      console.error('Error creando usuario:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    console.log('Usuario creado exitosamente:', data.user?.email)

    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })

  } catch (error: any) {
    console.error('Error en la API:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
