// ═══════════════════════════════════════════════
// src/routes/admin.ts
// ═══════════════════════════════════════════════
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { sendWarningEmail } from '../utils/email';
import { logger } from '../utils/logger';

const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

// Dashboard stats
adminRouter.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [
    totalUsers, activeUsers, pendingReports, totalSessions,
    acceptedSessions, bannedUsers, suspendedUsers, queueCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isOnline: true } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.timedSession.count(),
    prisma.timedSession.count({ where: { status: 'MUTUALLY_ACCEPTED' } }),
    prisma.user.count({ where: { status: 'BANNED' } }),
    prisma.user.count({ where: { status: 'SUSPENDED' } }),
    prisma.matchQueue.count(),
  ]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [todaySignups, todaySessions, todayAccepted] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.timedSession.count({ where: { startedAt: { gte: today } } }),
    prisma.timedSession.count({ where: { status: 'MUTUALLY_ACCEPTED', endedAt: { gte: today } } }),
  ]);

  const acceptRate = totalSessions > 0 ? ((acceptedSessions / totalSessions) * 100).toFixed(1) : '0';

  res.json({
    totalUsers, activeUsers, pendingReports, totalSessions, acceptedSessions,
    bannedUsers, suspendedUsers, queueCount, todaySignups, todaySessions,
    todayAccepted, acceptRate: `${acceptRate}%`,
  });
});

// List users
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', status, search } = req.query;
  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const users = await prisma.user.findMany({
    where: {
      ...(status ? { status: String(status) as any } : {}),
      ...(search ? { OR: [
        { email: { contains: String(search), mode: 'insensitive' } },
        { username: { contains: String(search), mode: 'insensitive' } },
        { displayName: { contains: String(search), mode: 'insensitive' } },
      ]} : {}),
    },
    orderBy: { createdAt: 'desc' },
    skip, take: parseInt(String(limit)),
    select: {
      id: true, email: true, username: true, displayName: true,
      status: true, role: true, trustScore: true, country: true,
      isOnline: true, createdAt: true, totalMatches: true, totalAccepted: true,
      _count: { select: { reportsReceived: true, warnings: true } },
    },
  });
  const total = await prisma.user.count();
  res.json({ users, total, page: parseInt(String(page)), totalPages: Math.ceil(total / parseInt(String(limit))) });
});

// Ban user
adminRouter.post('/ban/:userId', async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  await prisma.user.update({ where: { id: req.params.userId }, data: { status: 'BANNED' } });
  await prisma.adminAction.create({
    data: { adminId: req.user!.userId, targetId: req.params.userId, actionType: 'BAN', details: reason },
  });
  logger.info(`Admin ${req.user!.userId} banned user ${req.params.userId}`);
  res.json({ message: 'User banned' });
});

// Unban
adminRouter.post('/unban/:userId', async (req: AuthRequest, res: Response) => {
  await prisma.user.update({ where: { id: req.params.userId }, data: { status: 'ACTIVE' } });
  await prisma.adminAction.create({
    data: { adminId: req.user!.userId, targetId: req.params.userId, actionType: 'UNBAN' },
  });
  res.json({ message: 'User unbanned' });
});

// Suspend
adminRouter.post('/suspend/:userId', async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  await prisma.user.update({ where: { id: req.params.userId }, data: { status: 'SUSPENDED' } });
  await prisma.adminAction.create({
    data: { adminId: req.user!.userId, targetId: req.params.userId, actionType: 'SUSPEND', details: reason },
  });
  res.json({ message: 'User suspended' });
});

// Issue warning
adminRouter.post('/warn/:userId', async (req: AuthRequest, res: Response) => {
  const { reason, description } = req.body;
  const userId = req.params.userId;
  const warnCount = await prisma.warning.count({ where: { userId } });
  const level = warnCount === 0 ? 'FIRST' : warnCount === 1 ? 'SECOND' : 'THIRD';

  await prisma.warning.create({
    data: { userId, level, reason, description, issuedBy: req.user!.userId },
  });

  // Auto-suspend on 3rd warning
  if (level === 'THIRD') {
    await prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED', trustScore: { decrement: 50 } } });
  } else {
    await prisma.user.update({ where: { id: userId }, data: { trustScore: { decrement: 20 } } });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, displayName: true } });
  if (user) sendWarningEmail(user.email, user.displayName, reason).catch(() => {});

  res.json({ message: `Warning issued (${level})`, autoSuspended: level === 'THIRD' });
});

// Get reports
adminRouter.get('/reports', async (req: AuthRequest, res: Response) => {
  const { status = 'PENDING' } = req.query;
  const reports = await prisma.report.findMany({
    where: { status: String(status) as any },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      submitter: { select: { id: true, displayName: true, email: true } },
      reported: { select: { id: true, displayName: true, email: true, status: true, trustScore: true } },
    },
  });
  res.json(reports);
});

// Resolve report
adminRouter.patch('/reports/:id/resolve', async (req: AuthRequest, res: Response) => {
  const { status, reviewNote } = req.body;
  await prisma.report.update({
    where: { id: req.params.id },
    data: { status, reviewNote, reviewedBy: req.user!.userId },
  });
  res.json({ message: 'Report updated' });
});

// System config
adminRouter.get('/config', async (_req: AuthRequest, res: Response) => {
  const configs = await prisma.systemConfig.findMany();
  res.json(configs);
});

adminRouter.put('/config/:key', async (req: AuthRequest, res: Response) => {
  const { value } = req.body;
  await prisma.systemConfig.upsert({
    where: { key: req.params.key },
    update: { value },
    create: { key: req.params.key, value },
  });
  res.json({ message: 'Config updated' });
});

export { adminRouter };

// ═══════════════════════════════════════════════
// src/routes/users.ts
// ═══════════════════════════════════════════════
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get('/profile', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { profile: true, settings: true,
      _count: { select: { sessionsAsUser1: true, acceptedAsUser1: true } } },
    omit: { passwordHash: true, emailVerifyToken: true, passwordResetToken: true },
  } as any);
  res.json(user);
});

usersRouter.patch('/profile', async (req: AuthRequest, res: Response) => {
  const { displayName, bio, country, gender, avatarUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { ...(displayName && { displayName }), ...(bio !== undefined && { bio }),
      ...(country && { country }), ...(gender !== undefined && { gender }),
      ...(avatarUrl !== undefined && { avatarUrl }) },
  });
  res.json({ message: 'Profile updated', user });
});

usersRouter.patch('/profile/details', async (req: AuthRequest, res: Response) => {
  const { interests, languages, conversationVibe, introText, region } = req.body;
  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.userId },
    update: { ...(interests && { interests }), ...(languages && { languages }),
      ...(conversationVibe !== undefined && { conversationVibe }),
      ...(introText !== undefined && { introText }), ...(region !== undefined && { region }) },
    create: { userId: req.user!.userId, interests, languages, conversationVibe, introText, region },
  });
  res.json(profile);
});

usersRouter.patch('/settings', async (req: AuthRequest, res: Response) => {
  const settings = await prisma.userSettings.upsert({
    where: { userId: req.user!.userId },
    update: req.body,
    create: { userId: req.user!.userId, ...req.body },
  });
  res.json(settings);
});

usersRouter.patch('/password', async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.json({ message: 'Password updated successfully' });
});

usersRouter.delete('/account', async (req: AuthRequest, res: Response) => {
  const { password } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Password incorrect' });
  // Soft delete: anonymize
  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: `deleted_${user.id}@springmeet.deleted`,
      username: `deleted_${user.id}`,
      displayName: 'Deleted User',
      passwordHash: '',
      status: 'BANNED',
      bio: null,
      avatarUrl: null,
    },
  });
  res.json({ message: 'Account deleted. We\'re sorry to see you go. 🌸' });
});

export { usersRouter };
