import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';

type ContactInput = {
  email: string;
  first_name: string;
  last_name: string;
  tags?: string[];
  subscribed?: boolean;
};

export async function listContacts() {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  return contacts.map(mapContact);
}

export async function createContact(data: ContactInput) {
  try {
    const contact = await prisma.contact.create({
      data: {
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        tags: data.tags ?? [],
        subscribed: data.subscribed ?? true,
      },
    });

    return mapContact(contact);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Contact with this email already exists');
    }
    throw error;
  }
}

export async function updateContact(id: string, data: Partial<ContactInput>) {
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Contact not found');

  try {
    const updated = await prisma.contact.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        tags: data.tags,
        subscribed: data.subscribed,
      },
    });

    return mapContact(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Contact with this email already exists');
    }
    throw error;
  }
}

export async function deleteContact(id: string) {
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Contact not found');

  await prisma.contact.delete({ where: { id } });
}

export async function importContacts(contacts: ContactInput[]) {
  const results = [];

  for (const contact of contacts) {
    const upserted = await prisma.contact.upsert({
      where: { email: contact.email },
      update: {
        firstName: contact.first_name,
        lastName: contact.last_name,
        tags: contact.tags ?? [],
        subscribed: contact.subscribed ?? true,
      },
      create: {
        email: contact.email,
        firstName: contact.first_name,
        lastName: contact.last_name,
        tags: contact.tags ?? [],
        subscribed: contact.subscribed ?? true,
      },
    });

    results.push(mapContact(upserted));
  }

  return results;
}

function mapContact(contact: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: unknown;
  subscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: contact.id,
    email: contact.email,
    first_name: contact.firstName,
    last_name: contact.lastName,
    tags: Array.isArray(contact.tags) ? contact.tags : [],
    subscribed: contact.subscribed,
    created_at: contact.createdAt,
    updated_at: contact.updatedAt,
  };
}
