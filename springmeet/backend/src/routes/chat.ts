import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { io } from '../socket/socketServer';
import { moderateMessage } from '../services/moderation';
import { sendMatchAcceptedEmail } from '../utils/email';

const router = Router();
router.use(authenticate);

// ── POST /api/chat/send-message ──
router.post('/send-message', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, acceptedChatId, content } = req.body;
    const senderId = req.user!.userId;

    if (!content?.trim()) return res.status(400).json({ error: 'Message cannot be empty' });
    if (content.length > 2000) return res.status(400).json({ error: 'Message too long (max 2000 chars)' });

    // AI moderation check
    const modResult = await moderateMessage(content);
    if (modResult.blocked) {
      await prisma.moderationEvent.create({
        data: {
          userId: senderId,
          sessionId: sessionId || null,
          eventType: modResult.type,
          severity: modResult.severity,
          content,
          action: 'BLOCKED',
          aiScore: modResult.score,
        },
      });
      return res.status(400).json({ error: 'Message blocked by safety filters', reason: modResult.type });
    }

    // Validate access
    if (sessionId) {
      const session = await prisma.timedSession.findUnique({ where: { id: sessionId } });
      if (!session) return res.status(404).json({ error: 'Session not found' });
      if (session.user1Id !== senderId && session.user2Id !== senderId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (session.status !== 'ACTIVE') return res.status(400).json({ error: 'Session is no longer active' });
      if (session.expiresAt < new Date()) return res.status(400).json({ error: 'Session has expired' });
    }

    if (acceptedChatId) {
      const chat = await prisma.acceptedChat.findUnique({ where: { id: acceptedChatId } });
      if (!chat || (chat.user1Id !== senderId && chat.user2Id !== senderId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        sessionId: sessionId || null,
        acceptedChatId: acceptedChatId || null,
        content: content.trim(),
        isFlagged: modResult.flagged,
        flagReason: modResult.flagged ? modResult.type : null,
      },
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    if (sessionId) {
      await prisma.timedSession.update({ where: { id: sessionId }, data: { messageCount: { increment: 1 } } });
      io.to(`session:${sessionId}`).emit('chat:message', message);
    } else if (acceptedChatId) {
      io.to(`chat:${acceptedChatId}`).emit('chat:message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    logger.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── POST /api/chat/accept ──
router.post('/accept', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user!.userId;

    const session = await prisma.timedSession.findUnique({
      where: { id: sessionId },
      include: {
        user1: { select: { id: true, displayName: true, email: true } },
        user2: { select: { id: true, displayName: true, email: true } },
      },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'ACTIVE') return res.status(400).json({ error: 'Session no longer active' });
    if (session.expiresAt < new Date()) return res.status(400).json({ error: 'Session expired' });

    const isUser1 = session.user1Id === userId;
    const isUser2 = session.user2Id === userId;
    if (!isUser1 && !isUser2) return res.status(403).json({ error: 'Access denied' });

    const updateData = isUser1 ? { user1Accepted: true } : { user2Accepted: true };
    const updated = await prisma.timedSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    const otherId = isUser1 ? session.user2Id : session.user1Id;
    io.to(`session:${sessionId}`).emit('chat:accepted_by_one', { acceptedBy: userId });
    io.to(`user:${otherId}`).emit('chat:accepted_by_one', { acceptedBy: userId });

    // Check mutual accept
    if (updated.user1Accepted && updated.user2Accepted) {
      await prisma.timedSession.update({ where: { id: sessionId }, data: { status: 'MUTUALLY_ACCEPTED', endedAt: new Date() } });

      const acceptedChat = await prisma.acceptedChat.create({
        data: { sessionId, user1Id: session.user1Id, user2Id: session.user2Id },
      });

      // Update user stats
      await prisma.user.updateMany({
        where: { id: { in: [session.user1Id, session.user2Id] } },
        data: { totalAccepted: { increment: 1 } },
      });

      io.to(`session:${sessionId}`).emit('chat:mutual_accept', { acceptedChatId: acceptedChat.id });
      io.to(`user:${session.user1Id}`).emit('chat:mutual_accept', { acceptedChatId: acceptedChat.id });
      io.to(`user:${session.user2Id}`).emit('chat:mutual_accept', { acceptedChatId: acceptedChat.id });

      // Send emails
      sendMatchAcceptedEmail(session.user1.email, session.user1.displayName, session.user2.displayName).catch(() => {});
      sendMatchAcceptedEmail(session.user2.email, session.user2.displayName, session.user1.displayName).catch(() => {});

      return res.json({ mutualAccept: true, acceptedChatId: acceptedChat.id });
    }

    res.json({ mutualAccept: false, message: 'Waiting for the other person to accept' });
  } catch (err) {
    logger.error('Accept error:', err);
    res.status(500).json({ error: 'Failed to accept' });
  }
});

// ── POST /api/chat/expire ── (called by internal cron/job)
router.post('/expire', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = await prisma.timedSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'ACTIVE') return res.json({ message: 'Session already ended' });

    // Delete messages first (privacy: expired chats vanish)
    await prisma.message.deleteMany({ where: { sessionId } });
    await prisma.timedSession.update({
      where: { id: sessionId },
      data: { status: 'EXPIRED', endedAt: new Date() },
    });

    io.to(`session:${sessionId}`).emit('chat:expired', { sessionId });
    io.to(`user:${session.user1Id}`).emit('chat:expired', { sessionId });
    io.to(`user:${session.user2Id}`).emit('chat:expired', { sessionId });

    res.json({ message: 'Session expired and messages deleted' });
  } catch (err) {
    logger.error('Expire error:', err);
    res.status(500).json({ error: 'Failed to expire session' });
  }
});

// ── GET /api/chat/session/:id ──
router.get('/session/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const session = await prisma.timedSession.findUnique({
      where: { id: req.params.id },
      include: {
        user1: { select: { id: true, displayName: true, username: true, avatarUrl: true, country: true, isOnline: true } },
        user2: { select: { id: true, displayName: true, username: true, avatarUrl: true, country: true, isOnline: true } },
        messages: { where: { isDeleted: false }, orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, displayName: true } } } },
      },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.user1Id !== userId && session.user2Id !== userId) return res.status(403).json({ error: 'Access denied' });

    res.json(session);
  } catch {
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// ── GET /api/chat/history ──
router.get('/history', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const sessions = await prisma.timedSession.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: {
      user1: { select: { id: true, displayName: true, avatarUrl: true } },
      user2: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    // Note: messages NOT included — privacy, expired chats are content-free
  });
  res.json(sessions.map(s => ({
    id: s.id,
    status: s.status,
    mode: s.mode,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    partner: s.user1Id === userId ? s.user2 : s.user1,
    myAccepted: s.user1Id === userId ? s.user1Accepted : s.user2Accepted,
    theirAccepted: s.user1Id === userId ? s.user2Accepted : s.user1Accepted,
  })));
});

export default router;
