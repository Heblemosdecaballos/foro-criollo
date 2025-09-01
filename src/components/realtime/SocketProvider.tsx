
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface SocketContextType {
  isConnected: boolean;
  connectedUsers: User[];
  joinForum: (forumId: string) => void;
  leaveForum: (forumId: string) => void;
  emitNewPost: (postData: any) => void;
  emitNewComment: (commentData: any) => void;
  emitVoteUpdate: (voteData: any) => void;
  onNewPost: (callback: (postData: any) => void) => () => void;
  onNewComment: (callback: (commentData: any) => void) => () => void;
  onVoteUpdate: (callback: (voteData: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext debe usarse dentro de SocketProvider');
  }
  return context;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Obtener usuario actual de Supabase
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name
        });
      }
    };

    getUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const socket = useSocket({
    autoConnect: true,
    userData: user || undefined
  });

  const contextValue: SocketContextType = {
    isConnected: socket.isConnected,
    connectedUsers: socket.connectedUsers,
    joinForum: socket.joinForum,
    leaveForum: socket.leaveForum,
    emitNewPost: socket.emitNewPost,
    emitNewComment: socket.emitNewComment,
    emitVoteUpdate: socket.emitVoteUpdate,
    onNewPost: socket.onNewPost,
    onNewComment: socket.onNewComment,
    onVoteUpdate: socket.onVoteUpdate
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
