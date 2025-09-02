
// Comment section component with nested comments
'use client';

import { useState, useEffect } from 'react';
import { GalleryComment } from '@/lib/hall-of-fame/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  getGalleryComments, 
  createComment, 
  updateComment, 
  deleteComment,
  toggleCommentLike 
} from '@/lib/hall-of-fame/services';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  galleryId: string;
}

export default function CommentSection({ galleryId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [galleryId, user]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getGalleryComments(galleryId, user?.id);
      setComments(data);
    } catch (err) {
      setError('Error al cargar los comentarios');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!user) return;

    try {
      const newComment = await createComment(
        { gallery_id: galleryId, content, parent_id: parentId },
        user.id
      );

      if (parentId) {
        // Add reply to existing comment
        setComments(prevComments => 
          updateCommentsWithReply(prevComments, parentId, newComment)
        );
      } else {
        // Add new root comment
        setComments(prevComments => [...prevComments, newComment]);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const updatedComment = await updateComment(commentId, content);
      setComments(prevComments => 
        updateCommentInTree(prevComments, commentId, updatedComment)
      );
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prevComments => 
        removeCommentFromTree(prevComments, commentId)
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const userLiked = await toggleCommentLike(commentId, user.id);
      setComments(prevComments => 
        updateCommentLikes(prevComments, commentId, userLiked)
      );
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };

  // Helper functions for updating comment tree
  const updateCommentsWithReply = (
    comments: GalleryComment[], 
    parentId: string, 
    newReply: GalleryComment
  ): GalleryComment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentsWithReply(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  };

  const updateCommentInTree = (
    comments: GalleryComment[], 
    commentId: string, 
    updatedComment: GalleryComment
  ): GalleryComment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...updatedComment, replies: comment.replies };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updatedComment)
        };
      }
      return comment;
    });
  };

  const removeCommentFromTree = (
    comments: GalleryComment[], 
    commentId: string
  ): GalleryComment[] => {
    return comments.filter(comment => {
      if (comment.id === commentId) {
        return false;
      }
      if (comment.replies) {
        comment.replies = removeCommentFromTree(comment.replies, commentId);
      }
      return true;
    });
  };

  const updateCommentLikes = (
    comments: GalleryComment[], 
    commentId: string, 
    userLiked: boolean
  ): GalleryComment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes_count: userLiked ? comment.likes_count + 1 : comment.likes_count - 1,
          user_has_liked: userLiked
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentLikes(comment.replies, commentId, userLiked)
        };
      }
      return comment;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm py-2">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      {isAuthenticated && (
        <CommentForm onSubmit={handleAddComment} placeholder="Escribe un comentario..." />
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id}
            onReply={handleAddComment}
            onUpdate={handleUpdateComment}
            onDelete={handleDeleteComment}
            onLike={handleLikeComment}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">
          No hay comentarios aún. {isAuthenticated ? '¡Sé el primero en comentar!' : 'Inicia sesión para comentar.'}
        </p>
      )}
    </div>
  );
}
