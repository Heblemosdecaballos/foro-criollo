
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()
    
    console.log('[API] Sync session request received')
    
    if (!access_token || !refresh_token) {
      console.log('[API] Missing tokens')
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    // Crear cliente con el access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Establecer la sesión
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (error) {
      console.error('[API] Error setting session:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[API] Session synced successfully for user:', data.user?.email)

    // Crear response con cookies actualizadas
    const response = NextResponse.json({ success: true })
    
    // Establecer cookies manualmente
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    }

    // Establecer cookies de Supabase
    response.cookies.set(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`, 
      JSON.stringify({
        access_token,
        refresh_token,
        expires_at: data.session?.expires_at,
        user: data.user
      }), 
      cookieOptions
    )

    return response

  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
