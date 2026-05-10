import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [totalApartments, totalUnits, vacantUnits, recentVacancies] = await Promise.all([
      prisma.apartment.count({ where: { status: 'APPROVED' } }),
      prisma.unit.count({ where: { apartment: { status: 'APPROVED' } } }),
      prisma.unit.count({ where: { status: 'VACANT', apartment: { status: 'APPROVED' } } }),
      prisma.unit.findMany({
        where: { status: 'VACANT', apartment: { status: 'APPROVED' } },
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          apartment: {
            select: {
              id: true,
              name: true,
              neighborhood: true,
              pricePerMonth: true,
              houseType: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalApartments,
        totalUnits,
        vacantUnits,
        occupancyRate: totalUnits > 0 ? Math.round(((totalUnits - vacantUnits) / totalUnits) * 100) : 0,
        recentVacancies,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
