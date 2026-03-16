import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import {
  createCampaignSchema,
  scheduleCampaignSchema,
} from '../types/campaign.js';
import {
  createCampaign,
  getCampaignStatus,
  scheduleCampaign,
  sendCampaignNow,
} from '../services/campaign.service.js';

export const campaignsRouter = Router();

campaignsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = createCampaignSchema.parse(req.body);
    const campaign = await createCampaign(payload);
    res.status(201).json({ success: true, data: campaign });
  })
);

campaignsRouter.patch(
  '/:id/schedule',
  asyncHandler(async (req, res) => {
    const payload = scheduleCampaignSchema.parse(req.body);
    const campaign = await scheduleCampaign(req.params.id, payload);
    res.json({ success: true, data: campaign });
  })
);

campaignsRouter.get(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const result = await getCampaignStatus(req.params.id);
    res.json({ success: true, data: result });
  })
);

campaignsRouter.post(
  '/:id/send-now',
  asyncHandler(async (req, res) => {
    const result = await sendCampaignNow(req.params.id);
    res.json({ success: true, data: result });
  })
);