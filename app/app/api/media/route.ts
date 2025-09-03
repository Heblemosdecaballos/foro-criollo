
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { downloadFile } from '@/lib/s3'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const mediaType = searchParams.get('media_type')
    const uploadedBy = searchParams.get('uploaded_by')
    const search = searchParams.get('search')
    const isPublic = searchParams.get('is_public')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Build query
    let query = supabase
      .from('media_files')
      .select(`
        *,
        user_profiles!uploaded_by(id, name, email, avatar_url)
      `)

    // Apply filters
    if (category) {
      query = query.eq('metadata->>category', category)
    }

    if (mediaType) {
      if (mediaType === 'image') {
        query = query.like('mime_type', 'image/%')
      } else if (mediaType === 'video') {
        query = query.like('mime_type', 'video/%')
      }
    }

    if (uploadedBy) {
      query = query.eq('uploaded_by', uploadedBy)
    }

    if (search) {
      query = query.or(`original_filename.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Handle public/private filtering
    if (isPublic !== null) {
      const publicFilter = isPublic === 'true'
      query = query.eq('is_public', publicFilter)
    } else if (!user) {
      // Non-authenticated users can only see public files
      query = query.eq('is_public', true)
    } else if (
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      // Regular users can see public files and their own private files
      query = query.or(`is_public.eq.true,uploaded_by.eq.${user.id}`)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: mediaFiles, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch media files' },
        { status: 500 }
      )
    }

    // Generate signed URLs for each file
    const filesWithUrls = await Promise.all(
      (mediaFiles || []).map(async (file) => {
        try {
          const url = await downloadFile(file.cloud_storage_path, 3600)
          let thumbnailUrl: string | undefined
          
          if (file.thumbnail_path) {
            try {
              thumbnailUrl = await downloadFile(file.thumbnail_path, 3600)
            } catch (error) {
              console.error('Error generating thumbnail URL:', error)
            }
          }

          return {
            ...file,
            url,
            thumbnail_url: thumbnailUrl
          }
        } catch (error) {
          console.error(`Error generating URL for file ${file.id}:`, error)
          return {
            ...file,
            url: null,
            thumbnail_url: null,
            error: 'Failed to generate URL'
          }
        }
      })
    )

    // Get total count for pagination
    let countQuery = supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })

    // Apply the same filters for counting
    if (category) {
      countQuery = countQuery.eq('metadata->>category', category)
    }
    if (mediaType) {
      if (mediaType === 'image') {
        countQuery = countQuery.like('mime_type', 'image/%')
      } else if (mediaType === 'video') {
        countQuery = countQuery.like('mime_type', 'video/%')
      }
    }
    if (uploadedBy) {
      countQuery = countQuery.eq('uploaded_by', uploadedBy)
    }
    if (search) {
      countQuery = countQuery.or(`original_filename.ilike.%${search}%,description.ilike.%${search}%`)
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
      countQuery = countQuery.or(`is_public.eq.true,uploaded_by.eq.${user.id}`)
    }

    const { count } = await countQuery

    return NextResponse.json({
      files: filesWithUrls,
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit
    })

  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Get file details
    const { data: mediaFile, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !mediaFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (
      mediaFile.uploaded_by !== user.id &&
      user.email !== 'admin@hablandodecaballos.com' &&
      user.email !== 'moderator@hablandodecaballos.com'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete from S3
    try {
      const { deleteFile } = await import('@/lib/s3')
      await deleteFile(mediaFile.cloud_storage_path)
      
      // Delete thumbnail if exists
      if (mediaFile.thumbnail_path) {
        try {
          await deleteFile(mediaFile.thumbnail_path)
        } catch (error) {
          console.error('Error deleting thumbnail:', error)
        }
      }
    } catch (error) {
      console.error('Error deleting from S3:', error)
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete file record' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'media_delete',
        target_type: 'media',
        target_id: id,
        description: `Deleted media file: ${mediaFile.original_filename}`,
        metadata: { 
          original_filename: mediaFile.original_filename,
          file_size: mediaFile.file_size,
          mime_type: mediaFile.mime_type
        }
      })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting media file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
