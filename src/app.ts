import express from 'express';
import morgan from 'morgan';
import { contactsRouter } from './routes/contacts.js';
import { templatesRouter } from './routes/templates.js';
import { campaignsRouter } from './routes/campaigns.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/contacts', contactsRouter);
  app.use('/templates', templatesRouter);
  app.use('/campaigns', campaignsRouter);
  app.use('/health', healthRouter);

  app.use(errorHandler);

  return app;
}
