
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  // Extended profile fields
  bio?: string
  location?: string
  phone?: string
  website?: string
  birth_date?: string
  experience_years?: number
  specialties?: string[]
  social_links?: Record<string, string>
  cover_image_url?: string
  is_profile_public?: boolean
  show_email?: boolean
  show_phone?: boolean
  show_location?: boolean
  allow_messages?: boolean
  email_notifications?: boolean
  last_seen?: string
  reputation_score?: number
  level?: UserLevel
  // Calculated fields
  followers_count?: number
  following_count?: number
  activities_count?: number
  badges_count?: number
  is_following?: boolean
}

export interface Horse {
  id: string
  name: string
  slug: string
  andar_slug: string
  description?: string
  pedigree_url?: string
  created_by: string
  is_deleted: boolean
  created_at: string
  andar?: {
    name: string
    slug: string
  }
  media?: HorseMedia[]
  votes_count?: number
  comments_count?: number
  user_vote?: number
}

export interface HorseMedia {
  id: string
  horse_id: string
  storage_path: string
  public_url: string
  is_cover: boolean
  created_by: string
  created_at: string
}

export interface ForumCategory {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  order_index: number
  is_active: boolean
  created_at: string
  threads_count?: number
  posts_count?: number
  latest_thread?: {
    id: string
    title: string
    created_at: string
    created_by: string
    author_name?: string
  }
}

export interface ForumThread {
  id: string
  title: string
  slug: string
  content: string
  category_id: string
  created_by: string
  is_pinned: boolean
  is_locked: boolean
  is_deleted: boolean
  view_count: number
  created_at: string
  updated_at: string
  category?: ForumCategory
  author?: User
  replies_count?: number
  likes_count?: number
  user_liked?: boolean
  user_favorited?: boolean
  latest_reply?: {
    id: string
    created_at: string
    created_by: string
    author_name?: string
  }
}

export interface ForumReply {
  id: string
  content: string
  thread_id: string
  parent_id?: string
  created_by: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  author?: User
  likes_count?: number
  user_liked?: boolean
  replies?: ForumReply[]
}

export interface ForumStats {
  total_threads: number
  total_replies: number
  total_users: number
  latest_activity?: {
    thread_title: string
    thread_slug: string
    category_slug: string
    author_name: string
    created_at: string
  }
}

// Marketplace types
export interface MarketplaceCategory {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface MarketplaceAd {
  id: string
  title: string
  slug: string
  description: string
  price: number
  currency: string
  location: string
  category_id: string
  created_by: string
  contact_phone?: string
  contact_email?: string
  contact_whatsapp?: string
  status: 'active' | 'sold' | 'paused' | 'expired'
  is_featured: boolean
  expires_at?: string
  created_at: string
  updated_at: string
  category?: MarketplaceCategory
  author?: User
  images?: AdImage[]
  favorites_count?: number
  views_count?: number
  comments_count?: number
  user_favorited?: boolean
  tags?: string[]
}

export interface AdImage {
  id: string
  ad_id: string
  storage_path: string
  public_url: string
  is_primary: boolean
  order_index: number
  created_at: string
}

export interface AdComment {
  id: string
  content: string
  ad_id: string
  created_by: string
  is_deleted: boolean
  created_at: string
  author?: User
}

export interface AdFavorite {
  id: string
  ad_id: string
  created_by: string
  created_at: string
}

// Gamification types
export interface UserStats {
  user_id: string
  total_posts: number
  total_replies: number
  total_likes_received: number
  total_likes_given: number
  total_horses_submitted: number
  total_ads_published: number
  total_media_uploaded: number
  reputation_score: number
  level: number
  rank: string
  joined_at: string
  last_active: string
  user?: User
}

export interface UserBadge {
  id: string
  user_id: string
  badge_type: string
  badge_name: string
  description: string
  icon: string
  earned_at: string
}



export interface LeaderboardEntry {
  user_id: string
  user?: User
  score: number
  rank: number
  period: 'all_time' | 'month' | 'week'
  category: 'posts' | 'likes' | 'horses' | 'reputation'
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'reply' | 'badge' | 'ad_contact' | 'follow'
  title: string
  message: string
  data?: Record<string, any>
  read_at?: string
  created_at: string
}

// Gallery types
export interface MediaAlbum {
  id: string
  title: string
  slug: string
  description?: string
  created_by: string
  is_public: boolean
  cover_image_id?: string
  media_count: number
  views_count: number
  created_at: string
  updated_at: string
  author?: User
  cover_image?: MediaFile
}

export interface MediaItem {
  id: string
  album_id?: string
  title: string
  description?: string
  storage_path: string
  public_url: string
  file_type: 'image' | 'video'
  file_size: number
  dimensions?: string
  created_by: string
  created_at: string
  author?: User
  ratings?: MediaRating[]
  comments?: MediaComment[]
  average_rating?: number
  total_ratings?: number
  views_count: number
}

export interface MediaRating {
  id: string
  media_id: string
  created_by: string
  rating: number
  created_at: string
}

export interface MediaComment {
  id: string
  media_id: string
  content: string
  created_by: string
  created_at: string
  author?: User
}

// Poll types
export interface ThreadPoll {
  id: string
  thread_id: string
  question: string
  options: PollOption[]
  max_choices: number
  allow_multiple: boolean
  allow_change_vote: boolean
  show_results_without_vote: boolean
  close_date?: string
  is_closed: boolean
  total_votes: number
  created_at: string
}

export interface PollOption {
  id: string
  poll_id: string
  option_text: string
  vote_count: number
  order_index: number
}

export interface PollVote {
  id: string
  poll_id: string
  option_id: string
  created_by: string
  created_at: string
}

// FAQ types
export interface FAQCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface FAQItem {
  id: string
  category_id: string
  question: string
  answer: string
  slug: string
  is_featured: boolean
  helpful_votes: number
  not_helpful_votes: number
  order_index: number
  created_at: string
  updated_at: string
  category?: FAQCategory
}

export interface FAQVote {
  id: string
  faq_id: string
  created_by: string
  is_helpful: boolean
  created_at: string
}

// Advanced search types
export interface SearchFilters {
  query?: string
  type?: 'all' | 'threads' | 'replies' | 'horses' | 'ads' | 'media'
  category?: string
  author?: string
  date_from?: string
  date_to?: string
  min_replies?: number
  min_rating?: number
  location?: string
  price_min?: number
  price_max?: number
  sort_by?: 'relevance' | 'date' | 'popularity' | 'rating'
  sort_order?: 'asc' | 'desc'
}

export interface SearchResult {
  id: string
  type: 'thread' | 'reply' | 'horse' | 'ad' | 'media'
  title: string
  content: string
  url: string
  author?: User
  category?: string
  created_at: string
  thumbnail?: string
  metadata?: Record<string, any>
}

// User Profiles System Types
export interface UserActivity {
  id: string
  user_id: string
  activity_type: 'thread_created' | 'reply_posted' | 'horse_added' | 'ad_published' | 'media_uploaded' | 'vote_cast' | 'comment_added' | 'badge_earned' | 'level_up'
  title: string
  description?: string
  reference_id?: string
  reference_type?: 'thread' | 'horse' | 'ad' | 'media' | 'badge' | 'level'
  reference_url?: string
  metadata?: Record<string, any>
  points_earned?: number
  is_public: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'auto'
  language: 'es' | 'en'
  timezone: string
  notifications_email: boolean
  notifications_push: boolean
  notifications_forum: boolean
  notifications_marketplace: boolean
  notifications_hall: boolean
  privacy_profile: 'public' | 'registered' | 'private'
  privacy_activity: 'public' | 'registered' | 'private'
  privacy_stats: 'public' | 'registered' | 'private'
  created_at: string
  updated_at: string
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: User
  following?: User
}

export interface UserEarnedBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  reason?: string
  is_displayed: boolean
  badge?: Badge
}

export interface UserLevel {
  id: string
  name: string
  min_reputation: number
  color: string
  benefits?: string[]
}

export interface Badge {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  criteria: Record<string, any>
  points: number
  is_active: boolean
}

// Profile form types
export interface ProfileFormData {
  name: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  birth_date?: string
  experience_years?: number
  specialties: string[]
  social_links: Record<string, string>
  is_profile_public: boolean
  show_email: boolean
  show_phone: boolean
  show_location: boolean
  allow_messages: boolean
  email_notifications: boolean
}

export interface PrivacySettings {
  privacy_profile: 'public' | 'registered' | 'private'
  privacy_activity: 'public' | 'registered' | 'private'
  privacy_stats: 'public' | 'registered' | 'private'
  show_email: boolean
  show_phone: boolean
  show_location: boolean
  allow_messages: boolean
}

export interface NotificationSettings {
  notifications_email: boolean
  notifications_push: boolean
  notifications_forum: boolean
  notifications_marketplace: boolean
  notifications_hall: boolean
  email_notifications: boolean
}

// Admin Panel System Types
export interface AdminRole {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'content_manager'
  permissions: Record<string, any>
  assigned_by?: string
  assigned_at: string
  is_active: boolean
  expires_at?: string
  notes?: string
  user?: User
  assigned_by_user?: User
}

export interface SystemReport {
  id: string
  reporter_id?: string
  reported_type: 'thread' | 'reply' | 'horse' | 'ad' | 'user' | 'media'
  reported_id: string
  report_category: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'copyright' | 'other'
  description?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: string
  resolution?: string
  resolved_at?: string
  resolved_by?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  reporter?: User
  assigned_user?: User
  resolved_by_user?: User
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: string
  target_type?: string
  target_id?: string
  description: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
  admin?: User
}

export interface SiteSetting {
  id: string
  setting_key: string
  setting_value?: any
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'text'
  category: 'general' | 'security' | 'notifications' | 'features'
  description?: string
  is_public: boolean
  updated_by?: string
  updated_at: string
  updated_by_user?: User
}

export interface UserSuspension {
  id: string
  user_id: string
  suspended_by: string
  reason: string
  suspension_type: 'temporary' | 'permanent' | 'warning'
  expires_at?: string
  is_active: boolean
  appeal_status: 'none' | 'pending' | 'approved' | 'denied'
  appeal_reason?: string
  appeal_submitted_at?: string
  appeal_reviewed_by?: string
  appeal_reviewed_at?: string
  created_at: string
  user?: User
  suspended_by_user?: User
  appeal_reviewed_by_user?: User
}

export interface ModerationQueue {
  id: string
  content_type: 'thread' | 'reply' | 'horse' | 'ad' | 'media'
  content_id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  flagged_reason?: string
  priority: 'low' | 'normal' | 'high'
  assigned_to?: string
  reviewed_at?: string
  reviewed_by?: string
  reviewer_notes?: string
  auto_flagged: boolean
  flag_score: number
  created_at: string
  user?: User
  assigned_user?: User
  reviewer?: User
}

export interface AdminNotification {
  id: string
  admin_id: string
  title: string
  message: string
  type: 'report' | 'moderation' | 'system' | 'security'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_read: boolean
  action_url?: string
  metadata?: Record<string, any>
  created_at: string
  read_at?: string
}

// Admin Dashboard Types
export interface AdminStats {
  total_users: number
  new_users_today: number
  total_threads: number
  new_threads_today: number
  total_replies: number
  new_replies_today: number
  total_horses: number
  new_horses_today: number
  pending_reports: number
  pending_moderation: number
  active_suspensions: number
  total_page_views: number
}

export interface ContentStats {
  total_count: number
  today_count: number
  this_week_count: number
  this_month_count: number
  pending_count?: number
  flagged_count?: number
}

export interface UserManagementFilters {
  search?: string
  role?: string
  status?: 'active' | 'suspended' | 'banned'
  registration_date_from?: string
  registration_date_to?: string
  reputation_min?: number
  reputation_max?: number
  sort_by?: 'created_at' | 'name' | 'reputation_score' | 'last_seen'
  sort_order?: 'asc' | 'desc'
}

export interface ReportFilters {
  status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  category?: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'copyright' | 'other'
  reported_type?: 'thread' | 'reply' | 'horse' | 'ad' | 'user' | 'media'
  assigned_to?: string
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'priority' | 'status'
  sort_order?: 'asc' | 'desc'
}

// Media and File Upload System Types
export interface MediaFile {
  id: string
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  cloud_storage_path: string
  thumbnail_path?: string
  width?: number
  height?: number
  duration?: number
  alt_text?: string
  description?: string
  uploaded_by: string
  upload_status: 'processing' | 'completed' | 'failed'
  is_public: boolean
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  uploader?: User
  url?: string // Generated signed URL
  thumbnail_url?: string // Generated signed URL for thumbnail
}

export interface MediaAlbum {
  id: string
  title: string
  description?: string
  cover_image_id?: string
  created_by: string
  is_public: boolean
  view_count: number
  tags: string[]
  category?: 'hall_of_fame' | 'gallery' | 'events' | 'training'
  created_at: string
  updated_at: string
  creator?: User
  cover_image?: MediaFile
  media_count: number
  media_files?: MediaFile[]
}

export interface AlbumMedia {
  id: string
  album_id: string
  media_id: string
  order_index: number
  caption?: string
  added_at: string
  media?: MediaFile
  album?: MediaAlbum
}

export interface MediaComment {
  id: string
  media_id: string
  user_id: string
  content: string
  parent_id?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  user?: User
  replies?: MediaComment[]
  reply_count?: number
}

export interface MediaLike {
  id: string
  media_id: string
  user_id: string
  created_at: string
  user?: User
}

// File upload types
export interface FileUploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
  file_id?: string
  url?: string
}

export interface UploadOptions {
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  generateThumbnail?: boolean
  resize?: {
    width?: number
    height?: number
    quality?: number
  }
  category?: string
  isPublic?: boolean
  tags?: string[]
}

// Extended Horse type with media
export interface HorseWithMedia extends Horse {
  profile_image_id?: string
  gallery_album_id?: string
  video_url?: string
  awards_images?: string[]
  profile_image?: MediaFile
  gallery_album?: MediaAlbum
}

// Extended User type with media
export interface UserWithMedia extends User {
  avatar_media_id?: string
  avatar_media?: MediaFile
}

// Media gallery filters
export interface MediaFilters {
  category?: 'hall_of_fame' | 'gallery' | 'events' | 'training' | 'all'
  media_type?: 'image' | 'video' | 'all'
  uploaded_by?: string
  tags?: string[]
  date_from?: string
  date_to?: string
  is_public?: boolean
  search?: string
  sort_by?: 'created_at' | 'title' | 'view_count' | 'file_size'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
