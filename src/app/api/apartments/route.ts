import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUserFromRequest, requireRole } from '@/lib/auth';

const createApartmentSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(20),
  houseType: z.enum(['SINGLE_ROOM', 'BEDSITTER', 'ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM']),
  totalUnits: z.number().int().min(1),
  pricePerMonth: z.number().min(500),
  amenities: z.array(z.string()).default([]),
  address: z.string().min(5),
  neighborhood: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  units: z.array(z.object({
    unitNumber: z.string(),
    floor: z.number().optional(),
    status: z.enum(['VACANT', 'OCCUPIED', 'RESERVED']).default('VACANT'),
    price: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
});

// GET all approved apartments (public) or landlord's own listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const myListings = searchParams.get('myListings') === 'true';
    const houseType = searchParams.get('houseType');
    const neighborhood = searchParams.get('neighborhood');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const vacantOnly = searchParams.get('vacantOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // If myListings=true, return landlord's own listings
    if (myListings) {
      const user = getUserFromRequest(request);
      if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

      const apartments = await prisma.apartment.findMany({
        where: { landlordId: user.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isCover: true }, take: 1 },
          units: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: apartments.map(a => ({
          ...a,
          vacantCount: a.units.filter(u => u.status === 'VACANT').length,
        })),
      });
    }

    const where: Record<string, unknown> = { status: 'APPROVED' };
    if (houseType) where.houseType = houseType;
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.pricePerMonth = {};
      if (minPrice) (where.pricePerMonth as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.pricePerMonth as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (vacantOnly) {
      where.units = { some: { status: 'VACANT' } };
    }

    const [apartments, total] = await Promise.all([
      prisma.apartment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isCover: true }, take: 1 },
          units: true,
          landlord: { select: { id: true, name: true, phone: true } },
        },
      }),
      prisma.apartment.count({ where }),
    ]);

    const enriched = apartments.map(apt => ({
      ...apt,
      vacantCount: apt.units.filter(u => u.status === 'VACANT').length,
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get apartments error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST create apartment (LANDLORD only)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'LANDLORD', 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = createApartmentSchema.parse(body);
    const { units, ...aptData } = data;

    const apartment = await prisma.apartment.create({
      data: {
        ...aptData,
        landlordId: user!.userId,
        status: 'PENDING',
        units: units ? {
          create: units.map(u => ({ ...u, updatedAt: new Date() })),
        } : undefined,
      },
      include: {
        units: true,
        images: true,
        landlord: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: apartment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create apartment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
