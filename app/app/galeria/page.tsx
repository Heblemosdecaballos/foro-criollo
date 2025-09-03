
import { createServerSupabaseClient } from '@/lib/supabase'
import { MediaGallery } from '@/components/gallery/media-gallery'
import { MediaFilters } from '@/lib/types'

interface GaleriaPageProps {
  searchParams: MediaFilters
}

export default async function GaleriaPage({ searchParams }: GaleriaPageProps) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Build media query
  let query = supabase
    .from('media_files')
    .select(`
      *,
      user_profiles!uploaded_by(id, name, email, avatar_url)
    `)

  // Apply filters
  if (searchParams.category && searchParams.category !== 'all') {
    query = query.eq('metadata->>category', searchParams.category)
  } else {
    // Default to gallery category for this page
    query = query.eq('metadata->>category', 'gallery')
  }

  if (searchParams.media_type && searchParams.media_type !== 'all') {
    if (searchParams.media_type === 'image') {
      query = query.like('mime_type', 'image/%')
    } else if (searchParams.media_type === 'video') {
      query = query.like('mime_type', 'video/%')
    }
  }

  if (searchParams.search) {
    query = query.or(`original_filename.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  if (searchParams.uploaded_by) {
    query = query.eq('uploaded_by', searchParams.uploaded_by)
  }

  if (searchParams.date_from) {
    query = query.gte('created_at', searchParams.date_from)
  }

  if (searchParams.date_to) {
    query = query.lte('created_at', searchParams.date_to)
  }

  // Handle public/private filtering
  if (searchParams.is_public !== undefined) {
    query = query.eq('is_public', searchParams.is_public)
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

  const limit = searchParams.limit || 24
  const offset = searchParams.offset || 0
  const sortBy = searchParams.sort_by || 'created_at'
  const sortOrder = searchParams.sort_order || 'desc'

  // Apply sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)

  const { data: mediaFiles, error } = await query

  if (error) {
    console.error('Error fetching media files:', error)
  }

  // Get total count for pagination
  let countQuery = supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })

  // Apply the same filters for counting
  if (searchParams.category && searchParams.category !== 'all') {
    countQuery = countQuery.eq('metadata->>category', searchParams.category)
  } else {
    countQuery = countQuery.eq('metadata->>category', 'gallery')
  }

  if (searchParams.media_type && searchParams.media_type !== 'all') {
    if (searchParams.media_type === 'image') {
      countQuery = countQuery.like('mime_type', 'image/%')
    } else if (searchParams.media_type === 'video') {
      countQuery = countQuery.like('mime_type', 'video/%')
    }
  }

  if (searchParams.search) {
    countQuery = countQuery.or(`original_filename.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  if (searchParams.uploaded_by) {
    countQuery = countQuery.eq('uploaded_by', searchParams.uploaded_by)
  }

  if (searchParams.date_from) {
    countQuery = countQuery.gte('created_at', searchParams.date_from)
  }

  if (searchParams.date_to) {
    countQuery = countQuery.lte('created_at', searchParams.date_to)
  }

  // Apply visibility filters
  if (searchParams.is_public !== undefined) {
    countQuery = countQuery.eq('is_public', searchParams.is_public)
  } else if (!user) {
    countQuery = countQuery.eq('is_public', true)
  } else if (
    user.email !== 'admin@hablandodecaballos.com' &&
    user.email !== 'moderator@hablandodecaballos.com'
  ) {
    countQuery = countQuery.or(`is_public.eq.true,uploaded_by.eq.${user.id}`)
  }

  const { count } = await countQuery

  // Get albums for gallery category
  const { data: albums } = await supabase
    .from('media_albums')
    .select(`
      *,
      user_profiles!created_by(id, name, email, avatar_url),
      media_files!cover_image_id(id, filename, cloud_storage_path, thumbnail_path, mime_type),
      album_media(id, media_id)
    `)
    .eq('category', 'gallery')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <MediaGallery 
      initialMediaFiles={mediaFiles || []}
      initialAlbums={albums || []}
      totalFiles={count || 0}
      filters={searchParams}
      currentUser={user}
      category="gallery"
      showUpload={!!user}
    />
  )
}
