import { Router } from 'express';

export const campaignsRouter = Router();

campaignsRouter.get('/:id/status', (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});
