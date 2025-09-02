
// Component for displaying gallery items (photos/videos)
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HorseGalleryItem } from '@/lib/hall-of-fame/types';
import { useAuth } from '@/hooks/useAuth';
import { toggleGalleryLike } from '@/lib/hall-of-fame/services';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

interface GalleryItemProps {
  item: HorseGalleryItem;
  onLikeUpdate?: (itemId: string, newLikesCount: number, userLiked: boolean) => void;
}

export default function GalleryItem({ item, onLikeUpdate }: GalleryItemProps) {
  const { user, isAuthenticated } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated || !user || isLiking) return;

    setIsLiking(true);
    try {
      const userLiked = await toggleGalleryLike(item.id, user.id);
      const newLikesCount = userLiked ? item.likes_count + 1 : item.likes_count - 1;
      onLikeUpdate?.(item.id, newLikesCount, userLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Media content */}
      <div className="relative">
        {item.media_type === 'image' ? (
          <div className="aspect-square relative bg-gray-100">
            <Image
              src={item.media_url}
              alt={item.title || 'Imagen de galería'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video">
            <video
              src={item.media_url}
              controls
              className="w-full h-full object-cover"
              preload="metadata"
            >
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and description */}
        {item.title && (
          <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
        )}
        {item.description && (
          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LikeButton
              liked={item.user_has_liked || false}
              likesCount={item.likes_count}
              onLike={handleLike}
              disabled={!isAuthenticated || isLiking}
            />
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">Comentarios</span>
            </button>
          </div>

          <span className="text-xs text-gray-400">
            {new Date(item.created_at).toLocaleDateString('es-ES')}
          </span>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <CommentSection galleryId={item.id} />
          </div>
        )}
      </div>
    </div>
  );
}
