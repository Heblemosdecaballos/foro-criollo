
'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, type UserData, type PostData, type CommentData, type VoteData } from '@/lib/socket-events';

interface UseSocketOptions {
  autoConnect?: boolean;
  userData?: UserData;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, userData } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (!autoConnect) return;

    // Crear conexión Socket.IO
    const socket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Conectado al servidor WebSocket');
      
      // Autenticar usuario si está disponible
      if (userData) {
        socket.emit(SOCKET_EVENTS.AUTHENTICATE, userData);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Desconectado del servidor WebSocket');
    });

    // Eventos de usuarios
    socket.on(SOCKET_EVENTS.USER_ONLINE, (user: UserData) => {
      setConnectedUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    });

    socket.on(SOCKET_EVENTS.USER_OFFLINE, ({ userId }: { userId: string }) => {
      setConnectedUsers(prev => prev.filter(u => u.id !== userId));
    });

    return () => {
      socket.disconnect();
    };
  }, [autoConnect, userData]);

  // Funciones de utilidad
  const joinForum = (forumId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_JOIN, forumId);
  };

  const leaveForum = (forumId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_LEAVE, forumId);
  };

  const emitNewPost = (postData: PostData) => {
    socketRef.current?.emit(SOCKET_EVENTS.POST_NEW, postData);
  };

  const emitNewComment = (commentData: CommentData) => {
    socketRef.current?.emit(SOCKET_EVENTS.COMMENT_NEW, commentData);
  };

  const emitVoteUpdate = (voteData: VoteData) => {
    socketRef.current?.emit(SOCKET_EVENTS.VOTE_UPDATE, voteData);
  };

  const startTyping = (forumId: string, postId?: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.TYPING_START, { forumId, postId });
  };

  const stopTyping = (forumId: string, postId?: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.TYPING_STOP, { forumId, postId });
  };

  // Suscribirse a eventos específicos
  const onNewPost = (callback: (postData: PostData) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.POST_NEW, callback);
    return () => socketRef.current?.off(SOCKET_EVENTS.POST_NEW, callback);
  };

  const onNewComment = (callback: (commentData: CommentData) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.COMMENT_NEW, callback);
    return () => socketRef.current?.off(SOCKET_EVENTS.COMMENT_NEW, callback);
  };

  const onVoteUpdate = (callback: (voteData: VoteData) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.VOTE_UPDATE, callback);
    return () => socketRef.current?.off(SOCKET_EVENTS.VOTE_UPDATE, callback);
  };

  const onTyping = (callback: (data: { userId: string; userEmail: string; postId?: string }) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.TYPING_START, callback);
    return () => socketRef.current?.off(SOCKET_EVENTS.TYPING_START, callback);
  };

  const onStopTyping = (callback: (data: { userId: string; postId?: string }) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.TYPING_STOP, callback);
    return () => socketRef.current?.off(SOCKET_EVENTS.TYPING_STOP, callback);
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectedUsers,
    // Acciones
    joinForum,
    leaveForum,
    emitNewPost,
    emitNewComment,
    emitVoteUpdate,
    startTyping,
    stopTyping,
    // Suscripciones
    onNewPost,
    onNewComment,
    onVoteUpdate,
    onTyping,
    onStopTyping
  };
}
