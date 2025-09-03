
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createSlug } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const andar = searchParams.get('andar')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    const supabase = createServerSupabaseClient()

    let query = supabase
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
            height
          )
        ),
        hall_votes(value),
        hall_comments(id),
        user_profiles!horses_created_by_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .eq('is_deleted', false)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (andar) {
      query = query.eq('andar_slug', andar)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,owner_name.ilike.%${search}%`)
    }

    const { data: horses, error } = await query

    if (error) {
      console.error('Error fetching horses:', error)
      return NextResponse.json({ error: 'Error fetching horses' }, { status: 500 })
    }

    // Transform data to include computed fields
    const transformedHorses = horses?.map(horse => ({
      ...horse,
      votes_count: horse.hall_votes?.reduce((acc: number, vote: any) => acc + vote.value, 0) || 0,
      comments_count: horse.hall_comments?.length || 0,
      cover_image: horse.horse_media?.find((media: any) => media.is_cover)?.media_files
    }))

    return NextResponse.json({ data: transformedHorses })
  } catch (error) {
    console.error('Error in horses API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      andar_slug,
      description,
      pedigree_url,
      owner_name,
      birth_date,
      color,
      height_cm,
      awards,
      media_ids = []
    } = body

    if (!name || !andar_slug) {
      return NextResponse.json({ 
        error: 'Name and andar are required' 
      }, { status: 400 })
    }

    const slug = createSlug(name)

    // Check if horse with same slug already exists for this andar
    const { data: existingHorse } = await supabase
      .from('horses')
      .select('id')
      .eq('andar_slug', andar_slug)
      .eq('slug', slug)
      .single()

    if (existingHorse) {
      return NextResponse.json({ 
        error: 'Ya existe un caballo con este nombre en el andar seleccionado' 
      }, { status: 409 })
    }

    // Create horse
    const { data: horse, error: horseError } = await supabase
      .from('horses')
      .insert({
        name,
        slug,
        andar_slug,
        description,
        pedigree_url,
        owner_name,
        birth_date,
        color,
        height_cm,
        awards,
        created_by: user.id
      })
      .select()
      .single()

    if (horseError) {
      console.error('Error creating horse:', horseError)
      return NextResponse.json({ error: 'Error creating horse' }, { status: 500 })
    }

    // Add media if provided
    if (media_ids.length > 0) {
      const horseMedia = media_ids.map((mediaId: string, index: number) => ({
        horse_id: horse.id,
        media_id: mediaId,
        is_cover: index === 0, // First image is cover
        order_index: index,
        created_by: user.id
      }))

      const { error: mediaError } = await supabase
        .from('horse_media')
        .insert(horseMedia)

      if (mediaError) {
        console.error('Error adding horse media:', mediaError)
        // Don't fail the whole operation, just log the error
      }
    }

    return NextResponse.json({ data: horse }, { status: 201 })
  } catch (error) {
    console.error('Error in horses POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
