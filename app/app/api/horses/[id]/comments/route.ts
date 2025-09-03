
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Params {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: comments, error } = await supabase
      .from('hall_comments')
      .select(`
        *,
        user_profiles!hall_comments_user_id_fkey(
          id,
          name,
          avatar_url
        ),
        replies:hall_comments!parent_id(
          *,
          user_profiles!hall_comments_user_id_fkey(
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('horse_id', params.id)
      .eq('is_deleted', false)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: 'Error fetching comments' }, { status: 500 })
    }

    return NextResponse.json({ data: comments || [] })
  } catch (error) {
    console.error('Error in comments GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, parent_id } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ 
        error: 'Comment content is required' 
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

    // If parent_id is provided, check if parent comment exists
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('hall_comments')
        .select('id')
        .eq('id', parent_id)
        .eq('horse_id', params.id)
        .eq('is_deleted', false)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
    }

    const { data: comment, error } = await supabase
      .from('hall_comments')
      .insert({
        horse_id: params.id,
        user_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null
      })
      .select(`
        *,
        user_profiles!hall_comments_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: 'Error creating comment' }, { status: 500 })
    }

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (error) {
    console.error('Error in comments POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
