import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!requireRole(user, 'ADMIN')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  const apartments = await prisma.apartment.findMany({
    where: status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      landlord: { select: { id: true, name: true, email: true, phone: true } },
      images: { where: { isCover: true }, take: 1 },
      _count: { select: { units: true } },
    },
  });

  return NextResponse.json({ success: true, data: apartments });
}
