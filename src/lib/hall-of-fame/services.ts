
// Services for Hall of Fame functionality
import { supabase } from '@/lib/supabaseClient';
import { 
  Horse, 
  HorseGalleryItem, 
  GalleryComment, 
  CreateHorseData, 
  CreateGalleryItemData, 
  CreateCommentData 
} from './types';

// Horse services
export async function getHorses(featured?: boolean): Promise<Horse[]> {
  let query = supabase
    .from('horses')
    .select('*')
    .order('created_at', { ascending: false });

  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function getHorseById(id: string): Promise<Horse | null> {
  const { data, error } = await supabase
    .from('horses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createHorse(horseData: CreateHorseData): Promise<Horse> {
  const { data, error } = await supabase
    .from('horses')
    .insert(horseData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHorse(id: string, horseData: Partial<CreateHorseData>): Promise<Horse> {
  const { data, error } = await supabase
    .from('horses')
    .update(horseData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHorse(id: string): Promise<void> {
  const { error } = await supabase
    .from('horses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Gallery services
export async function getHorseGallery(horseId: string, userId?: string): Promise<HorseGalleryItem[]> {
  let query = supabase
    .from('horse_gallery')
    .select('*')
    .eq('horse_id', horseId)
    .order('created_at', { ascending: false });

  const { data: galleryItems, error } = await query;
  
  if (error) throw error;
  
  if (!galleryItems || !userId) {
    return galleryItems || [];
  }

  // Check which items the user has liked
  const galleryIds = galleryItems.map((item: any) => item.id);
  const { data: likes } = await supabase
    .from('gallery_likes')
    .select('gallery_id')
    .eq('user_id', userId)
    .in('gallery_id', galleryIds);

  const likedIds = new Set(likes?.map((like: any) => like.gallery_id) || []);

  return galleryItems.map((item: any) => ({
    ...item,
    user_has_liked: likedIds.has(item.id)
  }));
}

export async function createGalleryItem(itemData: CreateGalleryItemData): Promise<HorseGalleryItem> {
  const { data, error } = await supabase
    .from('horse_gallery')
    .insert(itemData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('horse_gallery')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Like services
export async function toggleGalleryLike(galleryId: string, userId: string): Promise<boolean> {
  // Check if like exists
  const { data: existingLike } = await supabase
    .from('gallery_likes')
    .select('id')
    .eq('gallery_id', galleryId)
    .eq('user_id', userId)
    .single();

  if (existingLike) {
    // Remove like
    const { error } = await supabase
      .from('gallery_likes')
      .delete()
      .eq('gallery_id', galleryId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return false;
  } else {
    // Add like
    const { error } = await supabase
      .from('gallery_likes')
      .insert({ gallery_id: galleryId, user_id: userId });
    
    if (error) throw error;
    return true;
  }
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
  // Check if like exists
  const { data: existingLike } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single();

  if (existingLike) {
    // Remove like
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return false;
  } else {
    // Add like
    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId });
    
    if (error) throw error;
    return true;
  }
}

// Comment services
export async function getGalleryComments(galleryId: string, userId?: string): Promise<GalleryComment[]> {
  const { data: comments, error } = await supabase
    .from('gallery_comments')
    .select(`
      *,
      author:profiles(full_name, role)
    `)
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  
  if (!comments) return [];

  // Check which comments the user has liked
  let likedCommentIds = new Set<string>();
  if (userId) {
    const commentIds = comments.map((comment: any) => comment.id);
    const { data: likes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', userId)
      .in('comment_id', commentIds);
    
    likedCommentIds = new Set(likes?.map((like: any) => like.comment_id) || []);
  }

  // Organize comments in a tree structure
  const commentMap = new Map<string, GalleryComment>();
  const rootComments: GalleryComment[] = [];

  // First pass: create all comments with like status
  comments.forEach((comment: any) => {
    const processedComment: GalleryComment = {
      ...comment,
      user_has_liked: likedCommentIds.has(comment.id),
      replies: []
    };
    commentMap.set(comment.id, processedComment);
  });

  // Second pass: organize into tree structure
  comments.forEach((comment: any) => {
    const processedComment = commentMap.get(comment.id)!;
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies!.push(processedComment);
      }
    } else {
      rootComments.push(processedComment);
    }
  });

  return rootComments;
}

export async function createComment(commentData: CreateCommentData, userId: string): Promise<GalleryComment> {
  const { data, error } = await supabase
    .from('gallery_comments')
    .insert({
      ...commentData,
      user_id: userId
    })
    .select(`
      *,
      author:profiles(full_name, role)
    `)
    .single();

  if (error) throw error;
  return { ...data, user_has_liked: false, replies: [] };
}

export async function updateComment(id: string, content: string): Promise<GalleryComment> {
  const { data, error } = await supabase
    .from('gallery_comments')
    .update({ content })
    .eq('id', id)
    .select(`
      *,
      author:profiles(full_name, role)
    `)
    .single();

  if (error) throw error;
  return { ...data, user_has_liked: false, replies: [] };
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase
    .from('gallery_comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Search and filter services
export async function searchHorses(query: string): Promise<Horse[]> {
  const { data, error } = await supabase
    .from('horses')
    .select('*')
    .or(`name.ilike.%${query}%,creator.ilike.%${query}%,genealogy.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Upload helper for media files
export async function uploadMedia(file: File, folder: string = 'hall-of-fame'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
