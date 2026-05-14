import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const vacancies = await prisma.unit.findMany({
      where: {
        status: 'VACANT',
        apartment: {
          status: 'APPROVED',
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
      include: {
        apartment: {
          include: {
            images: {
              where: { isCover: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json(vacancies);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
