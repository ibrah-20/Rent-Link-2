import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const updateUnitSchema = z.object({
  status: z.enum(['VACANT', 'OCCUPIED', 'RESERVED']),
  price: z.number().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; unitId: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const unit = await prisma.unit.findUnique({
      where: { id: params.unitId },
      include: { apartment: { select: { landlordId: true } } },
    });

    if (!unit || unit.apartmentId !== params.id) {
      return NextResponse.json({ success: false, error: 'Unit not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && unit.apartment.landlordId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateUnitSchema.parse(body);

    const updated = await prisma.unit.update({
      where: { id: params.unitId },
      data: { ...data, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
