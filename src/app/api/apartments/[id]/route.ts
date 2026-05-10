import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: [{ isCover: 'desc' }, { createdAt: 'asc' }] },
        units: { orderBy: { unitNumber: 'asc' } },
        landlord: { select: { id: true, name: true, phone: true, isVerified: true } },
      },
    });

    if (!apartment) {
      return NextResponse.json({ success: false, error: 'Apartment not found' }, { status: 404 });
    }

    if (apartment.status !== 'APPROVED') {
      const user = getUserFromRequest(request);
      if (!user || (user.userId !== apartment.landlordId && user.role !== 'ADMIN')) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...apartment,
        vacantCount: apartment.units.filter(u => u.status === 'VACANT').length,
      },
    });
  } catch (error) {
    console.error('Get apartment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const apartment = await prisma.apartment.findUnique({ where: { id: params.id } });
    if (!apartment) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (user.role !== 'ADMIN' && apartment.landlordId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Admin-only status update
    const updateData: Record<string, unknown> = {};
    if (user.role === 'ADMIN' && body.status) updateData.status = body.status;
    if (body.pricePerMonth) updateData.pricePerMonth = body.pricePerMonth;
    if (body.description) updateData.description = body.description;
    if (body.amenities) updateData.amenities = body.amenities;

    const updated = await prisma.apartment.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update apartment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'ADMIN', 'LANDLORD')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const apartment = await prisma.apartment.findUnique({ where: { id: params.id } });
    if (!apartment) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (user!.role !== 'ADMIN' && apartment.landlordId !== user!.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.apartment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Apartment deleted' });
  } catch (error) {
    console.error('Delete apartment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
