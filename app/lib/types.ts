
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
