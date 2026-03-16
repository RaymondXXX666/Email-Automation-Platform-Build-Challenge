import { z } from 'zod';

export const contactSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  subscribed: z.boolean().default(true),
});

export const updateContactSchema = contactSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided'
);

export const importContactsSchema = z.array(contactSchema).min(1);
