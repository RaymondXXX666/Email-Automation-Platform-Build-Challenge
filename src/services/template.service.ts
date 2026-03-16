import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';

type TemplateInput = {
  name: string;
  subject: string;
  html_body: string;
  variables?: string[];
};

type UpdateTemplateInput = Partial<TemplateInput>;

export async function listTemplates() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return templates.map(mapTemplate);
}

export async function createTemplate(data: TemplateInput) {
  const template = await prisma.template.create({
    data: {
      name: data.name,
      subject: data.subject,
      htmlBody: data.html_body,
      variables: data.variables ?? [],
    },
  });

  return mapTemplate(template);
}

export async function updateTemplate(id: string, data: UpdateTemplateInput) {
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Template not found');
  }

  const updated = await prisma.template.update({
    where: { id },
    data: {
      name: data.name,
      subject: data.subject,
      htmlBody: data.html_body,
      variables: data.variables,
    },
  });

  return mapTemplate(updated);
}

export async function deleteTemplate(id: string) {
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Template not found');
  }

  await prisma.template.delete({
    where: { id },
  });
}

export async function previewTemplate(
  id: string,
  values: Record<string, string>
) {
  const template = await prisma.template.findUnique({
    where: { id },
  });

  if (!template) {
    throw new AppError(404, 'Template not found');
  }

  const renderedSubject = renderTemplate(template.subject, values);
  const renderedHtmlBody = renderTemplate(template.htmlBody, values);

  return {
    id: template.id,
    name: template.name,
    subject: renderedSubject,
    html_body: renderedHtmlBody,
    variables: Array.isArray(template.variables) ? template.variables : [],
  };
}

function renderTemplate(content: string, values: Record<string, string>) {
  return content.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    return values[key] ?? `{{${key}}}`;
  });
}

function mapTemplate(template: {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  variables: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: template.id,
    name: template.name,
    subject: template.subject,
    html_body: template.htmlBody,
    variables: Array.isArray(template.variables) ? template.variables : [],
    created_at: template.createdAt,
    updated_at: template.updatedAt,
  };
}