import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { io } from '../socket/socketServer';

const router = Router();
router.use(authenticate);

// ── POST /api/matching/join-queue ──
router.post('/join-queue', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { mode = 'RANDOM', language, region, interests } = req.body;

    // Check if already in queue
    const existing = await prisma.matchQueue.findUnique({ where: { userId } });
    if (existing) await prisma.matchQueue.delete({ where: { userId } });

    // Check for blocks - get all users this user has blocked or been blocked by
    const blocks = await prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });
    const blockedIds = blocks.map(b => (b.blockerId === userId ? b.blockedId : b.blockerId));

    // Try to find a match in queue
    const candidate = await prisma.matchQueue.findFirst({
      where: {
        userId: { not: userId, notIn: blockedIds },
        mode: mode,
        ...(language ? { OR: [{ language: null }, { language }] } : {}),
      },
      orderBy: { joinedAt: 'asc' },
    });

    if (candidate) {
      // Remove candidate from queue
      await prisma.matchQueue.delete({ where: { userId: candidate.userId } });

      // Get admin session duration setting
      const config = await prisma.systemConfig.findUnique({ where: { key: 'SESSION_DURATION_MINUTES' } });
      const durationMinutes = parseInt(config?.value || '15');
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

      // Create timed session
      const session = await prisma.timedSession.create({
        data: {
          user1Id: userId,
          user2Id: candidate.userId,
          mode,
          expiresAt,
          durationMinutes,
        },
        include: {
          user1: { select: { id: true, displayName: true, username: true, avatarUrl: true, country: true } },
          user2: { select: { id: true, displayName: true, username: true, avatarUrl: true, country: true } },
        },
      });

      // Notify both users via socket
      const matchPayload = {
        sessionId: session.id,
        expiresAt: session.expiresAt,
        durationMinutes,
        mode,
      };

      io.to(`user:${userId}`).emit('match:found', {
        ...matchPayload,
        partner: session.user2,
      });
      io.to(`user:${candidate.userId}`).emit('match:found', {
        ...matchPayload,
        partner: session.user1,
      });

      // Schedule expiry job
      await redis.setex(`session:expiry:${session.id}`, durationMinutes * 60, session.id);

      return res.json({ matched: true, sessionId: session.id });
    }

    // No match yet — add to queue
    await prisma.matchQueue.create({
      data: { userId, mode, language, region, interests: interests || [] },
    });

    await redis.setex(`queue:user:${userId}`, 300, userId); // 5 min queue timeout
    io.to(`user:${userId}`).emit('queue:joined', { mode, position: 1 });

    res.json({ matched: false, queued: true });
  } catch (err) {
    logger.error('Join queue error:', err);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

// ── POST /api/matching/leave-queue ──
router.post('/leave-queue', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await prisma.matchQueue.deleteMany({ where: { userId } });
    await redis.del(`queue:user:${userId}`);
    io.to(`user:${userId}`).emit('queue:left');
    res.json({ message: 'Left queue' });
  } catch {
    res.status(500).json({ error: 'Failed to leave queue' });
  }
});

// ── GET /api/matching/queue-status ──
router.get('/queue-status', async (req: AuthRequest, res: Response) => {
  const entry = await prisma.matchQueue.findUnique({ where: { userId: req.user!.userId } });
  const totalInQueue = await prisma.matchQueue.count();
  res.json({ inQueue: !!entry, totalInQueue, entry });
});

export default router;
