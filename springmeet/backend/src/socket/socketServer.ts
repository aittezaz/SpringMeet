import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 10000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.slice(7);
      if (!token) return next(new Error('Authentication required'));
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).userRole = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info(`Socket connected: ${userId}`);

    // Join personal room
    socket.join(`user:${userId}`);

    // Mark online
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: new Date() },
    }).catch(() => {});

    // ── Join session room ──
    socket.on('session:join', async ({ sessionId }: { sessionId: string }) => {
      const session = await prisma.timedSession.findUnique({ where: { id: sessionId } });
      if (!session) return;
      if (session.user1Id !== userId && session.user2Id !== userId) return;
      socket.join(`session:${sessionId}`);
      logger.info(`${userId} joined session room ${sessionId}`);
    });

    // ── Join accepted chat room ──
    socket.on('chat:join', async ({ chatId }: { chatId: string }) => {
      const chat = await prisma.acceptedChat.findUnique({ where: { id: chatId } });
      if (!chat) return;
      if (chat.user1Id !== userId && chat.user2Id !== userId) return;
      socket.join(`chat:${chatId}`);
    });

    // ── Typing indicator ──
    socket.on('chat:typing', ({ sessionId, chatId, isTyping }: { sessionId?: string; chatId?: string; isTyping: boolean }) => {
      if (sessionId) socket.to(`session:${sessionId}`).emit('chat:typing', { userId, isTyping });
      if (chatId) socket.to(`chat:${chatId}`).emit('chat:typing', { userId, isTyping });
    });

    // ── Message read ──
    socket.on('chat:read', ({ messageId, chatId }: { messageId: string; chatId: string }) => {
      socket.to(`chat:${chatId}`).emit('chat:read', { messageId, readBy: userId });
    });

    // ── WebRTC signalling ──
    socket.on('webrtc:offer', ({ targetUserId, offer, callId }: any) => {
      io.to(`user:${targetUserId}`).emit('webrtc:offer', { offer, callId, fromUserId: userId });
    });
    socket.on('webrtc:answer', ({ targetUserId, answer, callId }: any) => {
      io.to(`user:${targetUserId}`).emit('webrtc:answer', { answer, callId });
    });
    socket.on('webrtc:ice-candidate', ({ targetUserId, candidate }: any) => {
      io.to(`user:${targetUserId}`).emit('webrtc:ice-candidate', { candidate, fromUserId: userId });
    });

    // ── Privacy alert (best-effort screenshot detection from client) ──
    socket.on('privacy:alert', ({ sessionId, chatId, type }: any) => {
      logger.info(`Privacy alert from ${userId}: ${type}`);
      if (sessionId) socket.to(`session:${sessionId}`).emit('safety:privacy_alert', { type, timestamp: new Date() });
      if (chatId) socket.to(`chat:${chatId}`).emit('safety:privacy_alert', { type, timestamp: new Date() });
    });

    // ── Disconnect ──
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${userId}`);
      // Check if user has other active sockets
      const sockets = await io.in(`user:${userId}`).fetchSockets();
      if (sockets.length === 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeen: new Date() },
        }).catch(() => {});
      }
    });
  });

  logger.info('🔌 Socket.IO server initialized');
}
