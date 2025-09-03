
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

    // Get media file from database
    const { data: mediaFile, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !mediaFile) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!mediaFile.is_public) {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required for private files' },
          { status: 401 }
        )
      }

      // Allow access if user owns the file or is admin/moderator
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
    }

    // Generate signed URL
    const signedUrl = await downloadFile(mediaFile.cloud_storage_path, 3600) // 1 hour expiry

    // Generate thumbnail URL if available
    let thumbnailUrl: string | undefined
    if (mediaFile.thumbnail_path) {
      try {
        thumbnailUrl = await downloadFile(mediaFile.thumbnail_path, 3600)
      } catch (error) {
        console.error('Error generating thumbnail URL:', error)
      }
    }

    return NextResponse.json({
      id: mediaFile.id,
      url: signedUrl,
      thumbnail_url: thumbnailUrl,
      filename: mediaFile.filename,
      original_filename: mediaFile.original_filename,
      mime_type: mediaFile.mime_type,
      file_size: mediaFile.file_size,
      width: mediaFile.width,
      height: mediaFile.height,
      duration: mediaFile.duration,
      alt_text: mediaFile.alt_text,
      description: mediaFile.description,
      tags: mediaFile.tags,
      created_at: mediaFile.created_at
    })

  } catch (error) {
    console.error('Error generating media URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate media URL' },
      { status: 500 }
    )
  }
}
