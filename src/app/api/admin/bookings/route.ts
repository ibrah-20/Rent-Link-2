import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!requireRole(user, 'ADMIN')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      apartment: { select: { name: true, houseType: true, address: true } },
      user: { select: { name: true, email: true, phone: true } },
      landlord: { select: { name: true, email: true, phone: true } },
    },
  });

  return NextResponse.json({ success: true, data: bookings });
}
