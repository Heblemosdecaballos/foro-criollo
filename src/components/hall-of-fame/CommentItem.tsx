
// Individual comment item component with nested replies
'use client';

import { useState } from 'react';
import { GalleryComment } from '@/lib/hall-of-fame/types';
import { useAuth } from '@/hooks/useAuth';
import LikeButton from './LikeButton';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: GalleryComment;
  currentUserId?: string;
  onReply: (content: string, parentId: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  depth?: number;
}

export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onUpdate,
  onDelete,
  onLike,
  depth = 0
}: CommentItemProps) {
  const { isAdmin } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = currentUserId === comment.user_id;
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const maxDepth = 3; // Limit nesting depth

  const handleReply = (content: string) => {
    onReply(content, comment.id);
    setShowReplyForm(false);
  };

  const handleUpdate = (content: string) => {
    onUpdate(comment.id, content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      onDelete(comment.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        {/* Comment header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-amber-700">
                {comment.author?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">
                {comment.author?.full_name || 'Usuario'}
                {comment.author?.role === 'admin' && (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Admin
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
            </div>
          </div>

          {/* Actions menu */}
          {canEdit && (
            <div className="flex items-center space-x-1">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-600 p-1"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment content */}
        {isEditing ? (
          <CommentForm
            initialValue={comment.content}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            submitLabel="Guardar"
            placeholder="Editar comentario..."
          />
        ) : (
          <div className="mb-3">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
        )}

        {/* Comment actions */}
        {!isEditing && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <LikeButton
                liked={comment.user_has_liked || false}
                likesCount={comment.likes_count}
                onLike={() => onLike(comment.id)}
                disabled={!currentUserId}
                size="sm"
              />

              {currentUserId && depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Responder
                </button>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showReplies ? 'Ocultar' : 'Mostrar'} respuestas ({comment.replies.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reply form */}
        {showReplyForm && currentUserId && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Escribe una respuesta..."
              submitLabel="Responder"
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
