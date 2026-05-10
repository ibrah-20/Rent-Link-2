import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const updateUnitSchema = z.object({
  status: z.enum(['VACANT', 'OCCUPIED', 'RESERVED']),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { status } = updateUnitSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');

    if (!unitId) {
      return NextResponse.json({ success: false, error: 'Unit ID is required' }, { status: 400 });
    }

    // Verify ownership
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { apartment: true },
    });

    if (!unit) {
      return NextResponse.json({ success: false, error: 'Unit not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && unit.apartment.landlordId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: { status },
    });

    // Also update the apartment updatedAt to trigger feed refresh
    await prisma.apartment.update({
      where: { id: unit.apartmentId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updatedUnit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update unit error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
