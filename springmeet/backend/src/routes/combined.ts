// ═══════════════════════════════════════════════
// src/routes/inbox.ts
// ═══════════════════════════════════════════════
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const inboxRouter = Router();
inboxRouter.use(authenticate);

inboxRouter.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const chats = await prisma.acceptedChat.findMany({
    where: {
      OR: [
        { user1Id: userId, user1Deleted: false },
        { user2Id: userId, user2Deleted: false },
      ],
      isActive: true,
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      user1: { select: { id: true, displayName: true, username: true, avatarUrl: true, isOnline: true, lastSeen: true } },
      user2: { select: { id: true, displayName: true, username: true, avatarUrl: true, isOnline: true, lastSeen: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  res.json(chats.map(c => ({
    id: c.id,
    partner: c.user1Id === userId ? c.user2 : c.user1,
    lastMessage: c.messages[0] || null,
    acceptedAt: c.acceptedAt,
    updatedAt: c.updatedAt,
  })));
});

inboxRouter.get('/:id/messages', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { cursor, limit = '50' } = req.query;

  const chat = await prisma.acceptedChat.findUnique({ where: { id } });
  if (!chat || (chat.user1Id !== userId && chat.user2Id !== userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const messages = await prisma.message.findMany({
    where: { acceptedChatId: id, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: parseInt(String(limit)),
    ...(cursor ? { cursor: { id: String(cursor) }, skip: 1 } : {}),
    include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  res.json(messages.reverse());
});

inboxRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const chat = await prisma.acceptedChat.findUnique({ where: { id: req.params.id } });
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  const isUser1 = chat.user1Id === userId;
  const isUser2 = chat.user2Id === userId;
  if (!isUser1 && !isUser2) return res.status(403).json({ error: 'Access denied' });
  await prisma.acceptedChat.update({
    where: { id: req.params.id },
    data: isUser1 ? { user1Deleted: true } : { user2Deleted: true },
  });
  res.json({ message: 'Chat deleted from your inbox' });
});

export { inboxRouter };

// ═══════════════════════════════════════════════
// src/routes/reports.ts
// ═══════════════════════════════════════════════
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const reportsRouter = Router();
reportsRouter.use(authenticate);

reportsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { reportedId, sessionId, reason, description } = req.body;
    if (!reportedId || !reason) return res.status(400).json({ error: 'reportedId and reason required' });

    await prisma.report.create({
      data: { submitterId: req.user!.userId, reportedId, sessionId, reason, description },
    });
    res.status(201).json({ message: 'Report submitted. Our team will review it within 24 hours.' });
  } catch (err) {
    logger.error('Report error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

reportsRouter.post('/block', async (req: AuthRequest, res: Response) => {
  try {
    const { blockedId } = req.body;
    const blockerId = req.user!.userId;
    if (blockerId === blockedId) return res.status(400).json({ error: 'Cannot block yourself' });
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });
    res.json({ message: 'User blocked. They will never appear in your matches again.' });
  } catch {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

reportsRouter.delete('/block/:blockedId', async (req: AuthRequest, res: Response) => {
  await prisma.block.deleteMany({
    where: { blockerId: req.user!.userId, blockedId: req.params.blockedId },
  });
  res.json({ message: 'User unblocked' });
});

export { reportsRouter };

// ═══════════════════════════════════════════════
// src/routes/calls.ts
// ═══════════════════════════════════════════════
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../socket/socketServer';

const callsRouter = Router();
callsRouter.use(authenticate);

callsRouter.post('/start', async (req: AuthRequest, res: Response) => {
  const { acceptedChatId, type = 'VOICE' } = req.body;
  const callerId = req.user!.userId;
  const chat = await prisma.acceptedChat.findUnique({ where: { id: acceptedChatId } });
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  const receiverId = chat.user1Id === callerId ? chat.user2Id : chat.user1Id;

  const call = await prisma.call.create({
    data: { callerId, receiverId, acceptedChatId, type },
    include: { caller: { select: { id: true, displayName: true, avatarUrl: true } } },
  });

  io.to(`user:${receiverId}`).emit('call:incoming', { callId: call.id, caller: call.caller, type });
  res.json({ callId: call.id });
});

callsRouter.post('/accept/:callId', async (req: AuthRequest, res: Response) => {
  const call = await prisma.call.update({
    where: { id: req.params.callId },
    data: { status: 'ACTIVE', startedAt: new Date() },
  });
  io.to(`user:${call.callerId}`).emit('call:accepted', { callId: call.id });
  res.json({ message: 'Call accepted' });
});

callsRouter.post('/reject/:callId', async (req: AuthRequest, res: Response) => {
  const call = await prisma.call.update({
    where: { id: req.params.callId },
    data: { status: 'REJECTED', endedAt: new Date() },
  });
  io.to(`user:${call.callerId}`).emit('call:rejected', { callId: call.id });
  res.json({ message: 'Call rejected' });
});

callsRouter.post('/end/:callId', async (req: AuthRequest, res: Response) => {
  const call = await prisma.call.findUnique({ where: { id: req.params.callId } });
  if (!call) return res.status(404).json({ error: 'Call not found' });
  const duration = call.startedAt ? Math.floor((Date.now() - call.startedAt.getTime()) / 1000) : 0;
  const updated = await prisma.call.update({
    where: { id: req.params.callId },
    data: { status: 'ENDED', endedAt: new Date(), durationSeconds: duration },
  });
  io.to(`user:${call.callerId}`).emit('call:ended', { callId: call.id });
  io.to(`user:${call.receiverId}`).emit('call:ended', { callId: call.id });
  res.json({ message: 'Call ended', durationSeconds: duration });
});

export { callsRouter };

// ═══════════════════════════════════════════════
// src/routes/notifications.ts
// ═══════════════════════════════════════════════
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifications);
});

notificationsRouter.patch('/read-all', async (req: AuthRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ message: 'All notifications marked as read' });
});

notificationsRouter.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json({ message: 'Marked as read' });
});

export { notificationsRouter };

// ═══════════════════════════════════════════════
// src/routes/health.ts
// ═══════════════════════════════════════════════
import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';

const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'SpringMeet API 🌸' });
  } catch {
    res.status(503).json({ status: 'unhealthy' });
  }
});

export { healthRouter };
