import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
  const apartments = await prisma.apartment.findMany({
    include: {
      images: true,
    },
  });
  
  for (const apt of apartments) {
    console.log(`${apt.name} has ${apt.images.length} images`);
  }
}

checkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
