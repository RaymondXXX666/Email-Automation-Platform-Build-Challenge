import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().default(''),
  RESEND_FROM_EMAIL: z.string().email().default('onboarding@resend.dev'),
  CRON_SCHEDULE: z.string().default('*/1 * * * *'),
});

export const env = envSchema.parse(process.env);
