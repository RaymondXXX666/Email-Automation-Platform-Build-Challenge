import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';

type CreateCampaignInput = {
  name: string;
  template_id: string;
  target_tags: string[];
};

type ScheduleCampaignInput = {
  scheduled_at: string;
};

export async function createCampaign(data: CreateCampaignInput) {
  const template = await prisma.template.findUnique({
    where: { id: data.template_id },
  });

  if (!template) {
    throw new AppError(404, 'Template not found');
  }

  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      templateId: data.template_id,
      targetTags: data.target_tags,
      scheduledAt: null,
      status: 'draft',
    },
    include: {
      template: true,
    },
  });

  return mapCampaign(campaign);
}

export async function scheduleCampaign(
  id: string,
  data: ScheduleCampaignInput
) {
  const existing = await prisma.campaign.findUnique({
    where: { id },
    include: {
      template: true,
    },
  });

  if (!existing) {
    throw new AppError(404, 'Campaign not found');
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      scheduledAt: new Date(data.scheduled_at),
      status: 'scheduled',
    },
    include: {
      template: true,
    },
  });

  return mapCampaign(updated);
}

export async function getCampaignStatus(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      template: true,
      sendLogs: true,
    },
  });

  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    scheduled_at: campaign.scheduledAt,
    sent_count: campaign.sentCount,
    failed_count: campaign.failedCount,
    target_tags: Array.isArray(campaign.targetTags) ? campaign.targetTags : [],
    template: {
      id: campaign.template.id,
      name: campaign.template.name,
      subject: campaign.template.subject,
    },
    send_log_count: campaign.sendLogs.length,
    created_at: campaign.createdAt,
    updated_at: campaign.updatedAt,
  };
}

export async function sendCampaignNow(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      template: true,
    },
  });

  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }

  const targetTags = Array.isArray(campaign.targetTags) ? campaign.targetTags : [];

  const contacts = await prisma.contact.findMany({
    where: {
      subscribed: true,
    },
  });

  const matchedContacts = contacts.filter((contact) => {
    const contactTags = Array.isArray(contact.tags) ? contact.tags : [];
    return targetTags.some((tag) => contactTags.includes(tag));
  });

  await prisma.campaign.update({
    where: { id },
    data: {
      status: 'sending',
      sentCount: 0,
      failedCount: 0,
    },
  });

  let sentCount = 0;
  let failedCount = 0;

  for (const contact of matchedContacts) {
    try {
      const renderedSubject = renderTemplate(campaign.template.subject, {
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email,
      });

      const renderedHtmlBody = renderTemplate(campaign.template.htmlBody, {
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email,
      });

      await prisma.sendLog.create({
        data: {
          campaignId: campaign.id,
          contactId: contact.id,
          status: 'sent',
          resendMessageId: null,
          errorMessage: null,
        },
      });

      sentCount += 1;

      console.log('Mock send success', {
        to: contact.email,
        subject: renderedSubject,
        html: renderedHtmlBody,
      });
    } catch (error) {
      failedCount += 1;

      await prisma.sendLog.create({
        data: {
          campaignId: campaign.id,
          contactId: contact.id,
          status: 'failed',
          resendMessageId: null,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  const finalStatus = failedCount > 0 && sentCount === 0 ? 'failed' : 'sent';

  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data: {
      status: finalStatus,
      sentCount,
      failedCount,
    },
    include: {
      template: true,
      sendLogs: true,
    },
  });

  return {
    id: updatedCampaign.id,
    name: updatedCampaign.name,
    status: updatedCampaign.status,
    scheduled_at: updatedCampaign.scheduledAt,
    sent_count: updatedCampaign.sentCount,
    failed_count: updatedCampaign.failedCount,
    send_log_count: updatedCampaign.sendLogs.length,
    target_tags: Array.isArray(updatedCampaign.targetTags)
      ? updatedCampaign.targetTags
      : [],
    template: {
      id: updatedCampaign.template.id,
      name: updatedCampaign.template.name,
      subject: updatedCampaign.template.subject,
    },
    created_at: updatedCampaign.createdAt,
    updated_at: updatedCampaign.updatedAt,
  };
}

function renderTemplate(content: string, values: Record<string, string>) {
  return content.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    return values[key] ?? `{{${key}}}`;
  });
}

function mapCampaign(campaign: {
  id: string;
  name: string;
  templateId: string;
  targetTags: unknown;
  scheduledAt: Date | null;
  status: string;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
  template: {
    id: string;
    name: string;
    subject: string;
  };
}) {
  return {
    id: campaign.id,
    name: campaign.name,
    template_id: campaign.templateId,
    target_tags: Array.isArray(campaign.targetTags) ? campaign.targetTags : [],
    scheduled_at: campaign.scheduledAt,
    status: campaign.status,
    sent_count: campaign.sentCount,
    failed_count: campaign.failedCount,
    template: {
      id: campaign.template.id,
      name: campaign.template.name,
      subject: campaign.template.subject,
    },
    created_at: campaign.createdAt,
    updated_at: campaign.updatedAt,
  };
}