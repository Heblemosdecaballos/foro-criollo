
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const createdBy = searchParams.get('created_by')
    const search = searchParams.get('search')
    const isPublic = searchParams.get('is_public')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Build query
    let query = supabase
      .from('media_albums')
      .select(`
        *,
        user_profiles!created_by(id, name, email, avatar_url),
        media_files!cover_image_id(id, filename, cloud_storage_path, thumbnail_path, mime_type),
        album_media(id, media_id, order_index)
      `)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (createdBy) {
      query = query.eq('created_by', createdBy)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Handle public/private filtering
    if (isPublic !== null) {
      const publicFilter = isPublic === 'true'
      query = query.eq('is_public', publicFilter)
    } else if (!user) {
      // Non-authenticated users can only see public albums
      query = query.eq('is_public', true)
    } else if (
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      // Regular users can see public albums and their own private albums
      query = query.or(`is_public.eq.true,created_by.eq.${user.id}`)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: albums, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch albums' },
        { status: 500 }
      )
    }

    // Add media count and generate cover image URLs
    const albumsWithCounts = await Promise.all(
      (albums || []).map(async (album) => {
        let coverImageUrl: string | undefined
        let coverThumbnailUrl: string | undefined
        
        if (album.media_files && album.media_files.cloud_storage_path) {
          try {
            const { downloadFile } = await import('@/lib/s3')
            coverImageUrl = await downloadFile(album.media_files.cloud_storage_path, 3600)
            
            if (album.media_files.thumbnail_path) {
              coverThumbnailUrl = await downloadFile(album.media_files.thumbnail_path, 3600)
            }
          } catch (error) {
            console.error('Error generating cover image URL:', error)
          }
        }

        return {
          ...album,
          media_count: album.album_media?.length || 0,
          cover_image_url: coverImageUrl,
          cover_thumbnail_url: coverThumbnailUrl
        }
      })
    )

    // Get total count for pagination
    let countQuery = supabase
      .from('media_albums')
      .select('*', { count: 'exact', head: true })

    // Apply the same filters for counting
    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category)
    }
    if (createdBy) {
      countQuery = countQuery.eq('created_by', createdBy)
    }
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (isPublic !== null) {
      const publicFilter = isPublic === 'true'
      countQuery = countQuery.eq('is_public', publicFilter)
    } else if (!user) {
      countQuery = countQuery.eq('is_public', true)
    } else if (
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      countQuery = countQuery.or(`is_public.eq.true,created_by.eq.${user.id}`)
    }

    const { count } = await countQuery

    return NextResponse.json({
      albums: albumsWithCounts,
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit
    })

  } catch (error) {
    console.error('Error fetching albums:', error)
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, category, isPublic = true, tags = [] } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Album title is required' },
        { status: 400 }
      )
    }

    // Create album
    const { data: album, error } = await supabase
      .from('media_albums')
      .insert({
        title,
        description,
        category,
        is_public: isPublic,
        tags,
        created_by: user.id
      })
      .select(`
        *,
        user_profiles!created_by(id, name, email, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create album' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'album_create',
        target_type: 'album',
        target_id: album.id,
        description: `Created album: ${title}`,
        metadata: { 
          title,
          category,
          is_public: isPublic
        }
      })

    return NextResponse.json({
      success: true,
      album: {
        ...album,
        media_count: 0,
        cover_image_url: null,
        cover_thumbnail_url: null
      }
    })

  } catch (error) {
    console.error('Error creating album:', error)
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    )
  }
}
