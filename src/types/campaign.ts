import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  template_id: z.string().min(1),
  target_tags: z.array(z.string()).min(1),
});

export const scheduleCampaignSchema = z.object({
  scheduled_at: z.string().datetime(),
});