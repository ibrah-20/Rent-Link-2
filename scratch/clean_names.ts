import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  await prisma.apartment.deleteMany({
    where: {
      name: {
        in: ['Kwalala Apartments', 'Ulitenda Apartments'],
      },
    },
  });
  console.log('Cleaned old records');
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
