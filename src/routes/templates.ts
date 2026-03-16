import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import {
  templateSchema,
  updateTemplateSchema,
  previewTemplateSchema,
} from '../types/template.js';
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  previewTemplate,
  updateTemplate,
} from '../services/template.service.js';

export const templatesRouter = Router();

templatesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const templates = await listTemplates();
    res.json({ success: true, data: templates });
  })
);

templatesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = templateSchema.parse(req.body);
    const template = await createTemplate(payload);
    res.status(201).json({ success: true, data: template });
  })
);

templatesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const payload = updateTemplateSchema.parse(req.body);
    const template = await updateTemplate(req.params.id, payload);
    res.json({ success: true, data: template });
  })
);

templatesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteTemplate(req.params.id);
    res.status(204).send();
  })
);

templatesRouter.post(
  '/:id/preview',
  asyncHandler(async (req, res) => {
    const payload = previewTemplateSchema.parse(req.body);
    const result = await previewTemplate(req.params.id, payload.variables);
    res.json({ success: true, data: result });
  })
);
