import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.status === 'BANNED') return res.status(403).json({ error: 'Account banned' });
    if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'Account suspended' });

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
}

export function requireModerator(req: AuthRequest, res: Response, next: NextFunction) {
  if (!['ADMIN', 'MODERATOR'].includes(req.user?.role || '')) {
    return res.status(403).json({ error: 'Moderator access required' });
  }
  next();
}
