import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { contactSchema, importContactsSchema, updateContactSchema } from '../types/contact.js';
import {
  createContact,
  deleteContact,
  importContacts,
  listContacts,
  updateContact,
} from '../services/contact.service.js';

export const contactsRouter = Router();

contactsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const contacts = await listContacts();
    res.json({ success: true, data: contacts });
  })
);

contactsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = contactSchema.parse(req.body);
    const contact = await createContact(payload);
    res.status(201).json({ success: true, data: contact });
  })
);

contactsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const payload = updateContactSchema.parse(req.body);
    const contact = await updateContact(req.params.id, payload);
    res.json({ success: true, data: contact });
  })
);

contactsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteContact(req.params.id);
    res.status(204).send();
  })
);

contactsRouter.post(
  '/import',
  asyncHandler(async (req, res) => {
    const payload = importContactsSchema.parse(req.body);
    const contacts = await importContacts(payload);
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  })
);
