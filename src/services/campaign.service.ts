import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

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

      const { data, error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [contact.email],
        subject: renderedSubject,
        html: renderedHtmlBody,
      });
      
      if (error) {
        throw new Error(
          typeof error.message === 'string' ? error.message : 'Resend send failed'
        );
      }
      
      await prisma.sendLog.create({
        data: {
          campaignId: campaign.id,
          contactId: contact.id,
          status: 'sent',
          resendMessageId: data?.id ?? null,
          errorMessage: null,
        },
      });
      
      sentCount += 1;
      
      console.log('Resend send success', {
        to: contact.email,
        resendMessageId: data?.id ?? null,
        subject: renderedSubject,
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

export async function getCampaignLogs(
  campaignId: string,
  page: number = 1,
  limit: number = 10
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }

  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;

  const skip = (safePage - 1) * safeLimit;

  const [logs, total] = await Promise.all([
    prisma.sendLog.findMany({
      where: { campaignId },
      include: {
        contact: true,
      },
      orderBy: {
        sentAt: 'desc',
      },
      skip,
      take: safeLimit,
    }),
    prisma.sendLog.count({
      where: { campaignId },
    }),
  ]);

  return {
    page: safePage,
    limit: safeLimit,
    total,
    total_pages: Math.ceil(total / safeLimit),
    data: logs.map((log) => ({
      id: log.id,
      campaign_id: log.campaignId,
      contact_id: log.contactId,
      contact: {
        email: log.contact.email,
        first_name: log.contact.firstName,
        last_name: log.contact.lastName,
      },
      status: log.status,
      resend_message_id: log.resendMessageId,
      error_message: log.errorMessage,
      sent_at: log.sentAt,
    })),
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