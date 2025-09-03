
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: andares, error } = await supabase
      .from('andares')
      .select('*')
      .order('slug', { ascending: true })

    if (error) {
      console.error('Error fetching andares:', error)
      return NextResponse.json({ error: 'Error fetching andares' }, { status: 500 })
    }

    return NextResponse.json({ data: andares || [] })
  } catch (error) {
    console.error('Error in andares API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
