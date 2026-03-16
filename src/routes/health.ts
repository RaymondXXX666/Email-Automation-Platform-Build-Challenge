import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { getCronState } from '../jobs/cron-state.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const cronState = getCronState();

    res.json({
      success: true,
      data: {
        api: 'ok',
        database: 'ok',
        cron: {
          status: cronState.started ? 'running' : 'not_started',
          last_tick_at: cronState.lastTickAt,
          last_success_at: cronState.lastSuccessAt,
          last_error_at: cronState.lastErrorAt,
          last_error_message: cronState.lastErrorMessage,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    const cronState = getCronState();

    res.status(500).json({
      success: false,
      data: {
        api: 'degraded',
        database: 'error',
        cron: {
          status: cronState.started ? 'running' : 'not_started',
          last_tick_at: cronState.lastTickAt,
          last_success_at: cronState.lastSuccessAt,
          last_error_at: cronState.lastErrorAt,
          last_error_message: cronState.lastErrorMessage,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
});
