
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
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

export interface UserLevel {
  level: number
  name: string
  min_points: number
  max_points?: number
  color: string
  benefits: string[]
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
  cover_image?: MediaItem
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
