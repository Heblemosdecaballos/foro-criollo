
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { downloadFile } from '@/lib/s3'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get album with media
    const { data: album, error } = await supabase
      .from('media_albums')
      .select(`
        *,
        user_profiles!created_by(id, name, email, avatar_url),
        media_files!cover_image_id(id, filename, cloud_storage_path, thumbnail_path, mime_type),
        album_media(
          id,
          order_index,
          caption,
          added_at,
          media_files!media_id(
            id,
            filename,
            original_filename,
            mime_type,
            file_size,
            cloud_storage_path,
            thumbnail_path,
            width,
            height,
            duration,
            alt_text,
            description,
            tags,
            created_at
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!album.is_public) {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required for private albums' },
          { status: 401 }
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
    }

    // Generate URLs for cover image
    let coverImageUrl: string | undefined
    let coverThumbnailUrl: string | undefined
    
    if (album.media_files && album.media_files.cloud_storage_path) {
      try {
        coverImageUrl = await downloadFile(album.media_files.cloud_storage_path, 3600)
        
        if (album.media_files.thumbnail_path) {
          coverThumbnailUrl = await downloadFile(album.media_files.thumbnail_path, 3600)
        }
      } catch (error) {
        console.error('Error generating cover image URL:', error)
      }
    }

    // Generate URLs for all media files
    const mediaWithUrls = await Promise.all(
      (album.album_media || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map(async (albumMedia: any) => {
          const mediaFile = albumMedia.media_files
          if (!mediaFile) return null

          try {
            const url = await downloadFile(mediaFile.cloud_storage_path, 3600)
            let thumbnailUrl: string | undefined
            
            if (mediaFile.thumbnail_path) {
              try {
                thumbnailUrl = await downloadFile(mediaFile.thumbnail_path, 3600)
              } catch (error) {
                console.error('Error generating thumbnail URL:', error)
              }
            }

            return {
              id: albumMedia.id,
              order_index: albumMedia.order_index,
              caption: albumMedia.caption,
              added_at: albumMedia.added_at,
              media: {
                ...mediaFile,
                url,
                thumbnail_url: thumbnailUrl
              }
            }
          } catch (error) {
            console.error(`Error generating URL for media ${mediaFile.id}:`, error)
            return {
              id: albumMedia.id,
              order_index: albumMedia.order_index,
              caption: albumMedia.caption,
              added_at: albumMedia.added_at,
              media: {
                ...mediaFile,
                url: null,
                thumbnail_url: null,
                error: 'Failed to generate URL'
              }
            }
          }
        })
    )

    // Filter out null entries
    const validMedia = mediaWithUrls.filter(Boolean)

    // Update view count
    await supabase
      .from('media_albums')
      .update({ view_count: (album.view_count || 0) + 1 })
      .eq('id', params.id)

    return NextResponse.json({
      ...album,
      media_count: validMedia.length,
      cover_image_url: coverImageUrl,
      cover_thumbnail_url: coverThumbnailUrl,
      media: validMedia
    })

  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json(
      { error: 'Failed to fetch album' },
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
    const { title, description, category, isPublic, tags, coverImageId } = body

    // Get existing album
    const { data: existingAlbum, error: fetchError } = await supabase
      .from('media_albums')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingAlbum) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (
      existingAlbum.created_by !== user.id &&
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update album
    const { data: album, error } = await supabase
      .from('media_albums')
      .update({
        title: title || existingAlbum.title,
        description: description !== undefined ? description : existingAlbum.description,
        category: category || existingAlbum.category,
        is_public: isPublic !== undefined ? isPublic : existingAlbum.is_public,
        tags: tags || existingAlbum.tags,
        cover_image_id: coverImageId !== undefined ? coverImageId : existingAlbum.cover_image_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        user_profiles!created_by(id, name, email, avatar_url),
        media_files!cover_image_id(id, filename, cloud_storage_path, thumbnail_path, mime_type)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update album' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'album_update',
        target_type: 'album',
        target_id: album.id,
        description: `Updated album: ${album.title}`,
        metadata: { 
          title: album.title,
          category: album.category,
          is_public: album.is_public
        }
      })

    return NextResponse.json({
      success: true,
      album
    })

  } catch (error) {
    console.error('Error updating album:', error)
    return NextResponse.json(
      { error: 'Failed to update album' },
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

    // Get album details
    const { data: album, error } = await supabase
      .from('media_albums')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (
      album.created_by !== user.id &&
      user.email !== 'admin@hablandodecaballos.com'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete album (album_media entries will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('media_albums')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete album' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'album_delete',
        target_type: 'album',
        target_id: params.id,
        description: `Deleted album: ${album.title}`,
        metadata: { 
          title: album.title,
          category: album.category
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Album deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting album:', error)
    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    )
  }
}
