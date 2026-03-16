import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logError } from '../utils/logger.js';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  logError('unhandled_error', {
    message: err instanceof Error ? err.message : 'Unknown error',
  });

  return res.status(500).json({ success: false, error: 'Internal server error' });
}
