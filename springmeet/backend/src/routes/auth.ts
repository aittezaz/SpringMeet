import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { prisma } from '../utils/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { authenticate, AuthRequest } from '../middleware/auth';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

const router = Router();

// ── POST /api/auth/register ──
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username, displayName, dateOfBirth, country } = req.body;

    if (!email || !password || !username || !displayName || !dateOfBirth || !country) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Age check (18+)
    const dob = new Date(dateOfBirth);
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) return res.status(400).json({ error: 'You must be 18 or older to use SpringMeet' });

    // Password strength
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
    });
    if (existing?.email === email.toLowerCase()) return res.status(409).json({ error: 'Email already registered' });
    if (existing?.username === username.toLowerCase()) return res.status(409).json({ error: 'Username already taken' });

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = uuid();

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        displayName,
        passwordHash,
        dateOfBirth: dob,
        country,
        emailVerifyToken,
        status: 'PENDING_VERIFICATION',
        profile: { create: {} },
        settings: { create: {} },
      },
      select: { id: true, email: true, displayName: true, username: true },
    });

    await sendVerificationEmail(user.email, user.displayName, emailVerifyToken).catch(e =>
      logger.error('Failed to send verification email', e)
    );

    res.status(201).json({ message: 'Account created! Please check your email to verify.', userId: user.id });
  } catch (err) {
    logger.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.status === 'BANNED') return res.status(403).json({ error: 'Account permanently banned' });
    if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'Account suspended. Contact support.' });
    if (!user.emailVerified) return res.status(403).json({ error: 'Please verify your email first' });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store refresh token
    await prisma.loginSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { isOnline: true, lastSeen: new Date() } });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── POST /api/auth/refresh ──
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const session = await prisma.loginSession.findUnique({ where: { refreshToken } });
    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email, role: payload.role });

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ── GET /api/auth/verify-email ──
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Verification token required' });

    const user = await prisma.user.findFirst({ where: { emailVerifyToken: String(token) } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null, status: 'ACTIVE' },
    });

    res.json({ message: 'Email verified successfully! You can now sign in.' });
  } catch (err) {
    logger.error('Email verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── POST /api/auth/forgot-password ──
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = uuid();
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: new Date(Date.now() + 3600000) },
    });

    await sendPasswordResetEmail(user.email, user.displayName, token).catch(e =>
      logger.error('Failed to send reset email', e)
    );

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    logger.error('Forgot password error:', err);
    res.status(500).json({ error: 'Request failed' });
  }
});

// ── POST /api/auth/reset-password ──
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and new password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token, passwordResetExpiry: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });

    // Revoke all sessions
    await prisma.loginSession.updateMany({ where: { userId: user.id }, data: { isRevoked: true } });

    res.json({ message: 'Password reset successfully. Please sign in with your new password.' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// ── POST /api/auth/logout ──
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.slice(7);
    if (token) {
      await prisma.loginSession.updateMany({ where: { token }, data: { isRevoked: true } });
    }
    await prisma.user.update({ where: { id: req.user!.userId }, data: { isOnline: false } });
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ── GET /api/auth/me ──
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, username: true, displayName: true,
      role: true, status: true, avatarUrl: true, trustScore: true,
      country: true, isOnline: true, createdAt: true,
      profile: true, settings: true,
    },
  });
  res.json(user);
});

export default router;
