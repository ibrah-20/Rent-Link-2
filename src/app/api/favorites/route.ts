import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apartmentId } = await req.json();
    if (!apartmentId) {
      return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 });
    }

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_apartmentId: {
          userId: user.userId,
          apartmentId,
        },
      },
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.savedListing.create({
        data: {
          userId: user.userId,
          apartmentId,
        },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saved = await prisma.savedListing.findMany({
      where: { userId: user.userId },
      select: { apartmentId: true },
    });

    return NextResponse.json(saved.map(s => s.apartmentId));
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
