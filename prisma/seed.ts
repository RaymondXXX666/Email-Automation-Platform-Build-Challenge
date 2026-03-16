import { prisma } from '../src/lib/prisma.js';

async function main() {
  await prisma.contact.createMany({
    data: [
      {
        email: 'zerong@test.com',
        firstName: 'Zerong',
        lastName: 'Xiao',
        tags: ['vip', 'nz'],
        subscribed: true,
      },
      {
        email: ' Adrian@test.com',
        firstName: 'Adrian',
        lastName: 'Senk-Hoffmann',
        tags: ['recruiter'],
        subscribed: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
