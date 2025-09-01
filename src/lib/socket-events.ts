
// Eventos WebSocket centralizados
export const SOCKET_EVENTS = {
  // Usuarios
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // Contenido
  POST_NEW: 'post:new',
  COMMENT_NEW: 'comment:new',
  VOTE_UPDATE: 'vote:update',
  
  // Notificaciones
  NOTIFICATION_PUSH: 'notification:push',
  
  // Salas/Foros
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  
  // Interacciones
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Sistema
  AUTHENTICATE: 'authenticate',
  DISCONNECT: 'disconnect'
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

// Tipos de datos para eventos
export interface UserData {
  id: string;
  email: string;
  name?: string;
}

export interface PostData {
  id: string;
  forumId: string;
  title: string;
  content: string;
  authorId: string;
  authorEmail: string;
}

export interface CommentData {
  id: string;
  postId: string;
  forumId: string;
  content: string;
  authorId: string;
  authorEmail: string;
}

export interface VoteData {
  postId?: string;
  commentId?: string;
  forumId: string;
  userId: string;
  voteType: 'up' | 'down';
  newScore: number;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'comment' | 'vote' | 'mention' | 'follow';
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export interface TypingData {
  forumId: string;
  postId?: string;
  userId?: string;
  userEmail?: string;
}
