
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
// ELIMINADO: Redis imports completamente removidos
// const { createClient } = require('redis');
// const { createAdapter } = require('@socket.io/redis-adapter');
const session = require('express-session');
// ELIMINADO: Redis store
// const RedisStore = require('connect-redis').default;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Eventos WebSocket definidos
const SOCKET_EVENTS = {
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  POST_NEW: 'post:new',
  COMMENT_NEW: 'comment:new',
  VOTE_UPDATE: 'vote:update',
  NOTIFICATION_PUSH: 'notification:push',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop'
};

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Configurar Socket.IO SIN Redis (modo standalone)
  console.log('⚠️ Redis COMPLETAMENTE DESHABILITADO - Socket.IO funcionará en modo standalone');
  
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
    // ELIMINADO: Redis adapter completamente removido
  });

  console.log('🔌 Socket.IO configurado SIN Redis Adapter');

  // Store para usuarios conectados (en memoria)
  const connectedUsers = new Map();

  // Eventos Socket.IO
  io.on('connection', (socket) => {
    console.log(`👤 Usuario conectado: ${socket.id}`);

    // Manejar autenticación de usuario
    socket.on('authenticate', (userData) => {
      if (userData && userData.id) {
        socket.userId = userData.id;
        socket.userEmail = userData.email;
        connectedUsers.set(userData.id, {
          socketId: socket.id,
          email: userData.email,
          connectedAt: new Date()
        });
        
        // Notificar a otros usuarios
        socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, {
          userId: userData.id,
          email: userData.email
        });
        
        console.log(`🔐 Usuario autenticado: ${userData.email}`);
      }
    });

    // Unirse a sala de foro específico
    socket.on(SOCKET_EVENTS.ROOM_JOIN, (forumId) => {
      socket.join(`forum_${forumId}`);
      console.log(`🏠 Usuario ${socket.userId} se unió al foro ${forumId}`);
    });

    // Salir de sala de foro
    socket.on(SOCKET_EVENTS.ROOM_LEAVE, (forumId) => {
      socket.leave(`forum_${forumId}`);
      console.log(`🚪 Usuario ${socket.userId} salió del foro ${forumId}`);
    });

    // Nuevo post creado
    socket.on(SOCKET_EVENTS.POST_NEW, (postData) => {
      // Broadcast a todos los usuarios en el foro
      socket.to(`forum_${postData.forumId}`).emit(SOCKET_EVENTS.POST_NEW, {
        ...postData,
        timestamp: new Date()
      });
      console.log(`📝 Nuevo post en foro ${postData.forumId}`);
    });

    // Nuevo comentario
    socket.on(SOCKET_EVENTS.COMMENT_NEW, (commentData) => {
      socket.to(`forum_${commentData.forumId}`).emit(SOCKET_EVENTS.COMMENT_NEW, {
        ...commentData,
        timestamp: new Date()
      });
      console.log(`💬 Nuevo comentario en post ${commentData.postId}`);
    });

    // Actualización de votos
    socket.on(SOCKET_EVENTS.VOTE_UPDATE, (voteData) => {
      socket.to(`forum_${voteData.forumId}`).emit(SOCKET_EVENTS.VOTE_UPDATE, {
        ...voteData,
        timestamp: new Date()
      });
    });

    // Indicador de escritura
    socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      socket.to(`forum_${data.forumId}`).emit(SOCKET_EVENTS.TYPING_START, {
        userId: socket.userId,
        userEmail: socket.userEmail,
        postId: data.postId
      });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      socket.to(`forum_${data.forumId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
        userId: socket.userId,
        postId: data.postId
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId: socket.userId
        });
        console.log(`👋 Usuario ${socket.userEmail} desconectado`);
      }
    });
  });

  // Endpoint para obtener usuarios conectados
  server.on('request', (req, res) => {
    if (req.url === '/api/socket/users' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        connectedUsers: Array.from(connectedUsers.values()),
        totalConnected: connectedUsers.size
      }));
      return;
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
    console.log(`🔌 WebSocket server activo SIN Redis adapter`);
  });
});

// Manejo de errores
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
