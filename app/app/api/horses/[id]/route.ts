
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Params {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: horse, error } = await supabase
      .from('horses')
      .select(`
        *,
        andares(name, slug, description),
        horse_media(
          id,
          media_id,
          is_cover,
          caption,
          order_index,
          media_files(
            id,
            filename,
            cloud_storage_path,
            mime_type,
            width,
            height,
            alt_text
          )
        ),
        hall_votes(
          id,
          value,
          user_id,
          created_at
        ),
        hall_comments(
          id,
          content,
          user_id,
          parent_id,
          created_at,
          user_profiles!hall_comments_user_id_fkey(
            id,
            name,
            avatar_url
          )
        ),
        user_profiles!horses_created_by_fkey(
          id,
          name,
          avatar_url,
          bio,
          location
        )
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single()

    if (error || !horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 })
    }

    // Get user's vote if logged in
    let userVote = null
    if (user) {
      const { data: vote } = await supabase
        .from('hall_votes')
        .select('value')
        .eq('horse_id', params.id)
        .eq('user_id', user.id)
        .single()
      
      userVote = vote?.value || null
    }

    // Calculate stats
    const votes = horse.hall_votes || []
    const votesCount = votes.reduce((acc: number, vote: any) => acc + vote.value, 0)
    const averageRating = votes.length > 0 ? votesCount / votes.length : 0
    const commentsCount = horse.hall_comments?.length || 0

    const transformedHorse = {
      ...horse,
      votes_count: votesCount,
      average_rating: Number(averageRating.toFixed(1)),
      total_votes: votes.length,
      comments_count: commentsCount,
      user_vote: userVote,
      media: horse.horse_media || []
    }

    return NextResponse.json({ data: transformedHorse })
  } catch (error) {
    console.error('Error fetching horse:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the horse or is admin
    const { data: horse, error: fetchError } = await supabase
      .from('horses')
      .select('created_by')
      .eq('id', params.id)
      .single()

    if (fetchError || !horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 })
    }

    const isOwner = horse.created_by === user.id
    const isAdmin = user.email === 'admin@hablandodecaballos.com'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      pedigree_url,
      owner_name,
      birth_date,
      color,
      height_cm,
      awards
    } = body

    const { data: updatedHorse, error } = await supabase
      .from('horses')
      .update({
        name,
        description,
        pedigree_url,
        owner_name,
        birth_date,
        color,
        height_cm,
        awards,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating horse:', error)
      return NextResponse.json({ error: 'Error updating horse' }, { status: 500 })
    }

    return NextResponse.json({ data: updatedHorse })
  } catch (error) {
    console.error('Error in horse PUT:', error)
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

    // Check if user owns the horse or is admin
    const { data: horse, error: fetchError } = await supabase
      .from('horses')
      .select('created_by')
      .eq('id', params.id)
      .single()

    if (fetchError || !horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 })
    }

    const isOwner = horse.created_by === user.id
    const isAdmin = user.email === 'admin@hablandodecaballos.com'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete
    const { error } = await supabase
      .from('horses')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting horse:', error)
      return NextResponse.json({ error: 'Error deleting horse' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Horse deleted successfully' })
  } catch (error) {
    console.error('Error in horse DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
