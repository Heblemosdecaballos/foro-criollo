
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { mediaIds, captions = {} } = body

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json(
        { error: 'Media IDs are required' },
        { status: 400 }
      )
    }

    // Get album and check permissions
    const { data: album, error: albumError } = await supabase
      .from('media_albums')
      .select('*')
      .eq('id', params.id)
      .single()

    if (albumError || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    if (
      album.created_by !== user.id &&
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Verify all media files exist and user has access
    const { data: mediaFiles, error: mediaError } = await supabase
      .from('media_files')
      .select('id, uploaded_by, is_public')
      .in('id', mediaIds)

    if (mediaError || !mediaFiles) {
      return NextResponse.json(
        { error: 'Error verifying media files' },
        { status: 500 }
      )
    }

    if (mediaFiles.length !== mediaIds.length) {
      return NextResponse.json(
        { error: 'Some media files not found' },
        { status: 404 }
      )
    }

    // Check if user has access to all media files
    const accessDeniedFiles = mediaFiles.filter(file => 
      !file.is_public && 
      file.uploaded_by !== user.id &&
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    )

    if (accessDeniedFiles.length > 0) {
      return NextResponse.json(
        { error: 'Access denied to some media files' },
        { status: 403 }
      )
    }

    // Get current max order index
    const { data: maxOrderData } = await supabase
      .from('album_media')
      .select('order_index')
      .eq('album_id', params.id)
      .order('order_index', { ascending: false })
      .limit(1)

    let nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1

    // Add media to album
    const albumMediaEntries = mediaIds.map((mediaId: string) => ({
      album_id: params.id,
      media_id: mediaId,
      order_index: nextOrderIndex++,
      caption: captions[mediaId] || null
    }))

    const { data: addedMedia, error: addError } = await supabase
      .from('album_media')
      .upsert(albumMediaEntries, { 
        onConflict: 'album_id,media_id',
        ignoreDuplicates: false 
      })
      .select(`
        *,
        media_files!media_id(id, filename, original_filename, mime_type, file_size)
      `)

    if (addError) {
      console.error('Database error:', addError)
      return NextResponse.json(
        { error: 'Failed to add media to album' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'album_media_add',
        target_type: 'album',
        target_id: params.id,
        description: `Added ${mediaIds.length} media file(s) to album: ${album.title}`,
        metadata: { 
          album_title: album.title,
          media_count: mediaIds.length,
          media_ids: mediaIds
        }
      })

    return NextResponse.json({
      success: true,
      added_media: addedMedia,
      message: `Successfully added ${mediaIds.length} media file(s) to album`
    })

  } catch (error) {
    console.error('Error adding media to album:', error)
    return NextResponse.json(
      { error: 'Failed to add media to album' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { mediaIds } = body

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json(
        { error: 'Media IDs are required' },
        { status: 400 }
      )
    }

    // Get album and check permissions
    const { data: album, error: albumError } = await supabase
      .from('media_albums')
      .select('*')
      .eq('id', params.id)
      .single()

    if (albumError || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    if (
      album.created_by !== user.id &&
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Remove media from album
    const { error: removeError } = await supabase
      .from('album_media')
      .delete()
      .eq('album_id', params.id)
      .in('media_id', mediaIds)

    if (removeError) {
      console.error('Database error:', removeError)
      return NextResponse.json(
        { error: 'Failed to remove media from album' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'album_media_remove',
        target_type: 'album',
        target_id: params.id,
        description: `Removed ${mediaIds.length} media file(s) from album: ${album.title}`,
        metadata: { 
          album_title: album.title,
          media_count: mediaIds.length,
          media_ids: mediaIds
        }
      })

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${mediaIds.length} media file(s) from album`
    })

  } catch (error) {
    console.error('Error removing media from album:', error)
    return NextResponse.json(
      { error: 'Failed to remove media from album' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { mediaOrdering } = body // Array of { media_id, order_index, caption? }

    if (!mediaOrdering || !Array.isArray(mediaOrdering)) {
      return NextResponse.json(
        { error: 'Media ordering data is required' },
        { status: 400 }
      )
    }

    // Get album and check permissions
    const { data: album, error: albumError } = await supabase
      .from('media_albums')
      .select('*')
      .eq('id', params.id)
      .single()

    if (albumError || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    if (
      album.created_by !== user.id &&
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update media ordering
    const updatePromises = mediaOrdering.map((item: any) => 
      supabase
        .from('album_media')
        .update({
          order_index: item.order_index,
          ...(item.caption !== undefined && { caption: item.caption })
        })
        .eq('album_id', params.id)
        .eq('media_id', item.media_id)
    )

    const results = await Promise.all(updatePromises)
    
    // Check if any updates failed
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Some updates failed:', errors)
      return NextResponse.json(
        { error: 'Failed to update some media ordering' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'album_media_reorder',
        target_type: 'album',
        target_id: params.id,
        description: `Reordered ${mediaOrdering.length} media file(s) in album: ${album.title}`,
        metadata: { 
          album_title: album.title,
          media_count: mediaOrdering.length
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Successfully updated media ordering'
    })

  } catch (error) {
    console.error('Error updating media ordering:', error)
    return NextResponse.json(
      { error: 'Failed to update media ordering' },
      { status: 500 }
    )
  }
}
