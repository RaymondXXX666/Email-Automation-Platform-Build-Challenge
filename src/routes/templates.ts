import { Router } from 'express';

export const templatesRouter = Router();

templatesRouter.get('/', (_req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});
