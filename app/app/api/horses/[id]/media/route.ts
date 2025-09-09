
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Params {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: media, error } = await supabase
      .from('horse_media')
      .select(`
        *,
        media_files(
          id,
          filename,
          cloud_storage_path,
          mime_type,
          width,
          height,
          alt_text,
          description
        )
      `)
      .eq('horse_id', params.id)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching horse media:', error)
      return NextResponse.json({ error: 'Error fetching media' }, { status: 500 })
    }

    return NextResponse.json({ data: media || [] })
  } catch (error) {
    console.error('Error in horse media GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the horse
    const { data: horse, error: horseError } = await supabase
      .from('horses')
      .select('created_by')
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single()

    if (horseError || !horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 })
    }

    const isOwner = horse.created_by === user.id
    const isAdmin = user.email === 'admin@hablandodecaballos.com'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { media_id, is_cover = false, caption } = await request.json()

    if (!media_id) {
      return NextResponse.json({ 
        error: 'Media ID is required' 
      }, { status: 400 })
    }

    // Check if media file exists
    const { data: mediaFile, error: mediaError } = await supabase
      .from('media_files')
      .select('id')
      .eq('id', media_id)
      .single()

    if (mediaError || !mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    // If setting as cover, unset current cover
    if (is_cover) {
      await supabase
        .from('horse_media')
        .update({ is_cover: false })
        .eq('horse_id', params.id)
        .eq('is_cover', true)
    }

    // Get next order index
    const { data: lastMedia } = await supabase
      .from('horse_media')
      .select('order_index')
      .eq('horse_id', params.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (lastMedia?.order_index || 0) + 1

    const { data: horseMedia, error } = await supabase
      .from('horse_media')
      .insert({
        horse_id: params.id,
        media_id,
        is_cover,
        caption,
        order_index: nextOrderIndex,
        created_by: user.id
      })
      .select(`
        *,
        media_files(
          id,
          filename,
          cloud_storage_path,
          mime_type,
          width,
          height
        )
      `)
      .single()

    if (error) {
      console.error('Error adding horse media:', error)
      return NextResponse.json({ error: 'Error adding media' }, { status: 500 })
    }

    return NextResponse.json({ data: horseMedia }, { status: 201 })
  } catch (error) {
    console.error('Error in horse media POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
