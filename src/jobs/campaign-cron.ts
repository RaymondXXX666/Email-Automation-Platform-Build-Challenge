import { CronJob } from 'cron';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { sendCampaignNow } from '../services/campaign.service.js';
import { logError, logInfo } from '../utils/logger.js';

export function startCampaignCron() {
  const job = new CronJob(env.CRON_SCHEDULE, async () => {
    logInfo('campaign_cron_tick');

    try {
      const now = new Date();

      const dueCampaigns = await prisma.campaign.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: {
            lte: now,
          },
        },
      });

      for (const campaign of dueCampaigns) {
        try {
          logInfo('campaign_cron_sending', { campaignId: campaign.id });
          await sendCampaignNow(campaign.id);
        } catch (error) {
          logError('campaign_cron_send_failed', {
            campaignId: campaign.id,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      logError('campaign_cron_failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  job.start();
  logInfo('campaign_cron_started', { schedule: env.CRON_SCHEDULE });

  return job;
}