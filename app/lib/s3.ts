
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createS3Client, getBucketConfig } from './aws-config'

const s3Client = createS3Client()
const { bucketName, folderPrefix } = getBucketConfig()

export async function uploadFile(
  buffer: Buffer, 
  fileName: string, 
  contentType: string = 'application/octet-stream',
  options: { 
    isPublic?: boolean
    generateThumbnail?: boolean 
    metadata?: Record<string, string>
  } = {}
): Promise<string> {
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured')
  }

  const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`
  
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: options.metadata || {},
    // Set public read if specified
    ...(options.isPublic && { ACL: 'public-read' as const })
  }

  try {
    const command = new PutObjectCommand(uploadParams)
    await s3Client.send(command)
    return key // Return the S3 key as cloud_storage_path
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload file to cloud storage')
  }
}

export async function downloadFile(key: string, expiresIn: number = 3600): Promise<string> {
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured')
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate download URL')
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured')
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Failed to delete file from cloud storage')
  }
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured')
  }

  try {
    // Copy object to new location
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey
    })

    await s3Client.send(copyCommand)

    // Delete old object
    await deleteFile(oldKey)

    return newKey
  } catch (error) {
    console.error('Error renaming file in S3:', error)
    throw new Error('Failed to rename file in cloud storage')
  }
}

export async function getFileInfo(key: string): Promise<{
  size: number
  lastModified: Date
  contentType: string
  metadata: Record<string, string>
}> {
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured')
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key
    })

    const response = await s3Client.send(command)

    return {
      size: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
      contentType: response.ContentType || 'application/octet-stream',
      metadata: response.Metadata || {}
    }
  } catch (error) {
    console.error('Error getting file info from S3:', error)
    throw new Error('Failed to get file information')
  }
}

export async function generateThumbnail(
  imageBuffer: Buffer,
  filename: string,
  options: {
    width?: number
    height?: number
    quality?: number
  } = {}
): Promise<string> {
  const { width = 300, height = 300, quality = 80 } = options
  
  // For now, we'll just upload the original image as thumbnail
  // In a production environment, you would use Sharp or similar to generate thumbnails
  const thumbnailKey = `${folderPrefix}thumbnails/${Date.now()}-thumb-${filename}`
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured')
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: thumbnailKey,
      Body: imageBuffer,
      ContentType: 'image/jpeg', // Assuming JPEG thumbnail
      Metadata: {
        'thumbnail-width': width.toString(),
        'thumbnail-height': height.toString(),
        'thumbnail-quality': quality.toString()
      }
    })

    await s3Client.send(command)
    return thumbnailKey
  } catch (error) {
    console.error('Error uploading thumbnail to S3:', error)
    throw new Error('Failed to upload thumbnail')
  }
}

// Helper function to get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Helper function to check if file is image
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

// Helper function to check if file is video
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

// Helper function to generate unique filename
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  const extension = getFileExtension(originalFilename)
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, "")
  
  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`
}
