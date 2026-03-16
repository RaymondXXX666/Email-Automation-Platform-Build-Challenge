import { CronJob } from 'cron';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { sendCampaignNow } from '../services/campaign.service.js';
import { logError, logInfo } from '../utils/logger.js';
import {
  markCronError,
  markCronStarted,
  markCronSuccess,
  markCronTick,
} from './cron-state.js';

export function startCampaignCron() {
  const job = new CronJob(env.CRON_SCHEDULE, async () => {
    markCronTick();
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
          const message =
            error instanceof Error ? error.message : 'Unknown error';

          markCronError(message);

          logError('campaign_cron_send_failed', {
            campaignId: campaign.id,
            message,
          });
        }
      }

      markCronSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      markCronError(message);

      logError('campaign_cron_failed', {
        message,
      });
    }
  });

  job.start();
  markCronStarted();

  logInfo('campaign_cron_started', { schedule: env.CRON_SCHEDULE });

  return job;
}