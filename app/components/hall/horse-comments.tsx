
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MessageCircle, Reply, Send, User } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  user_id: string
  created_at: string
  user_profiles: {
    id: string
    name: string
    avatar_url?: string
  }
  replies?: Comment[]
}

interface HorseCommentsProps {
  horseId: string
}

export function HorseComments({ horseId }: HorseCommentsProps) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchComments()
  }, [horseId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/horses/${horseId}/comments`)
      if (response.ok) {
        const { data } = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      toast.error('Debes iniciar sesión para comentar')
      return
    }

    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/horses/${horseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al enviar comentario')
      }

      const { data: comment } = await response.json()
      setComments(prev => [...prev, comment])
      setNewComment('')
      toast.success('Comentario agregado')
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error(error instanceof Error ? error.message : 'Error al enviar comentario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para responder')
      return
    }

    if (!replyContent.trim()) {
      toast.error('La respuesta no puede estar vacía')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/horses/${horseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: replyContent.trim(),
          parent_id: parentId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al enviar respuesta')
      }

      const { data: reply } = await response.json()
      
      // Add reply to the parent comment
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          }
        }
        return comment
      }))

      setReplyingTo(null)
      setReplyContent('')
      toast.success('Respuesta agregada')
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error(error instanceof Error ? error.message : 'Error al enviar respuesta')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isMounted || status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {session?.user ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Comparte tu opinión sobre este ejemplar..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="btn-equestrian"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Comentar
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <Card>
          <CardContent className="text-center py-6">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Inicia sesión para comentar sobre este ejemplar
            </p>
            <Link href="/auth/login">
              <Button className="btn-equestrian">
                Iniciar sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-6">
                {/* Comment Header */}
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user_profiles.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-sm">
                        {comment.user_profiles.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(comment.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {comment.content}
                    </p>
                    
                    {/* Reply Button */}
                    {session?.user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(replyingTo === comment.id ? null : comment.id)
                          setReplyContent('')
                        }}
                        className="text-xs h-auto p-1"
                      >
                        <Reply className="mr-1 h-3 w-3" />
                        Responder
                      </Button>
                    )}
                    
                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 space-y-3">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          rows={2}
                          className="text-sm"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent('')
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            disabled={isSubmitting || !replyContent.trim()}
                            onClick={() => handleSubmitReply(comment.id)}
                            className="btn-equestrian"
                          >
                            {isSubmitting ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-1" />
                                Enviando...
                              </>
                            ) : (
                              'Responder'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.user_profiles.avatar_url} />
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-medium text-xs">
                                  {reply.user_profiles.name}
                                </h5>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeDate(reply.created_at)}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin comentarios aún</h3>
            <p className="text-muted-foreground">
              Sé el primero en comentar sobre este ejemplar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
