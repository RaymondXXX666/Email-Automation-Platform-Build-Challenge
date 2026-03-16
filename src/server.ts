import { createApp } from './app.js';
import { env } from './config/env.js';
import { logInfo } from './utils/logger.js';
import { startCampaignCron } from './jobs/campaign-cron.js';

const app = createApp();

app.listen(env.PORT, () => {
  logInfo('server_started', { port: env.PORT });
  startCampaignCron();
});