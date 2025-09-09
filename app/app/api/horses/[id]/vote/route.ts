
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Params {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { value } = await request.json()

    if (!value || value < 1 || value > 5) {
      return NextResponse.json({ 
        error: 'Vote value must be between 1 and 5' 
      }, { status: 400 })
    }

    // Check if horse exists
    const { data: horse, error: horseError } = await supabase
      .from('horses')
      .select('id')
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single()

    if (horseError || !horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 })
    }

    // Upsert vote (insert or update)
    const { data: vote, error: voteError } = await supabase
      .from('hall_votes')
      .upsert({
        horse_id: params.id,
        user_id: user.id,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'horse_id,user_id'
      })
      .select()
      .single()

    if (voteError) {
      console.error('Error voting:', voteError)
      return NextResponse.json({ error: 'Error submitting vote' }, { status: 500 })
    }

    return NextResponse.json({ data: vote }, { status: 201 })
  } catch (error) {
    console.error('Error in vote API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('hall_votes')
      .delete()
      .eq('horse_id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing vote:', error)
      return NextResponse.json({ error: 'Error removing vote' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vote removed successfully' })
  } catch (error) {
    console.error('Error in vote DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
