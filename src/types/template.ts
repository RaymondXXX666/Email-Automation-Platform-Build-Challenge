import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  html_body: z.string().min(1),
  variables: z.array(z.string()).default([]),
});

export const updateTemplateSchema = templateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided'
);

export const previewTemplateSchema = z.object({
  variables: z.record(z.string()).default({}),
});