import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        api: 'ok',
        database: 'ok',
        cron: 'pending',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      data: {
        api: 'degraded',
        database: 'error',
        cron: 'pending',
      },
    });
  }
});
