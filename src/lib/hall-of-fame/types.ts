
// Types for Hall of Fame system
export interface Horse {
  id: string;
  name: string;
  creator: string | null;
  genealogy: string | null;
  additional_notes: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface HorseGalleryItem {
  id: string;
  horse_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  title: string | null;
  description: string | null;
  likes_count: number;
  created_at: string;
  user_has_liked?: boolean;
}

export interface GalleryComment {
  id: string;
  gallery_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_has_liked?: boolean;
  author?: {
    full_name: string | null;
    role: string;
  };
  replies?: GalleryComment[];
}

export interface CreateHorseData {
  name: string;
  creator?: string;
  genealogy?: string;
  additional_notes?: string;
  featured?: boolean;
}

export interface CreateGalleryItemData {
  horse_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  title?: string;
  description?: string;
}

export interface CreateCommentData {
  gallery_id: string;
  content: string;
  parent_id?: string;
}
