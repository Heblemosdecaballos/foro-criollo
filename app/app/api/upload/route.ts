
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { uploadFile, generateThumbnail, isImageFile, isVideoFile, generateUniqueFilename } from '@/lib/s3'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string || 'gallery'
    const isPublic = formData.get('isPublic') !== 'false'
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const generateThumbnails = formData.get('generateThumbnails') === 'true'

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed per upload' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.name} exceeds maximum size of 50MB`)
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`File type ${file.type} is not allowed`)
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.name)

        // Upload main file to S3
        const cloudStoragePath = await uploadFile(buffer, uniqueFilename, file.type, {
          isPublic,
          metadata: {
            'original-filename': file.name,
            'uploaded-by': user.id,
            'category': category
          }
        })

        // Generate thumbnail for images
        let thumbnailPath: string | null = null
        if (generateThumbnails && isImageFile(file.type)) {
          try {
            thumbnailPath = await generateThumbnail(buffer, uniqueFilename, {
              width: 300,
              height: 300,
              quality: 80
            })
          } catch (error) {
            console.error('Failed to generate thumbnail:', error)
          }
        }

        // Get image dimensions if it's an image
        let width: number | undefined
        let height: number | undefined
        let duration: number | undefined

        if (isImageFile(file.type)) {
          // In a production environment, you would use a library like Sharp to get dimensions
          // For now, we'll leave them undefined
        }

        if (isVideoFile(file.type)) {
          // In a production environment, you would extract video metadata
          // For now, we'll leave duration undefined
        }

        // Save file metadata to database
        const { data: mediaFile, error } = await supabase
          .from('media_files')
          .insert({
            filename: uniqueFilename,
            original_filename: file.name,
            file_size: file.size,
            mime_type: file.type,
            cloud_storage_path: cloudStoragePath,
            thumbnail_path: thumbnailPath,
            width,
            height,
            duration,
            uploaded_by: user.id,
            upload_status: 'completed',
            is_public: isPublic,
            tags,
            metadata: {
              category,
              upload_timestamp: new Date().toISOString()
            }
          })
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          throw new Error('Failed to save file metadata')
        }

        uploadedFiles.push({
          id: mediaFile.id,
          filename: mediaFile.filename,
          original_filename: mediaFile.original_filename,
          mime_type: mediaFile.mime_type,
          file_size: mediaFile.file_size,
          cloud_storage_path: mediaFile.cloud_storage_path,
          thumbnail_path: mediaFile.thumbnail_path,
          upload_status: mediaFile.upload_status
        })

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        uploadedFiles.push({
          filename: file.name,
          error: fileError instanceof Error ? fileError.message : 'Unknown error',
          upload_status: 'failed'
        })
      }
    }

    // Log admin action if files were uploaded successfully
    const successfulUploads = uploadedFiles.filter(f => f.upload_status === 'completed')
    if (successfulUploads.length > 0) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: 'media_upload',
          description: `Uploaded ${successfulUploads.length} file(s) to ${category}`,
          metadata: { 
            category, 
            file_count: successfulUploads.length,
            file_ids: successfulUploads.map(f => f.id)
          }
        })
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      uploaded_count: successfulUploads.length,
      failed_count: uploadedFiles.length - successfulUploads.length
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
