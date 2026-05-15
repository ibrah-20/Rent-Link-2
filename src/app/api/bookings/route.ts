import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apartmentId, viewingDate, message, customerName, customerPhone, customerEmail, moveInDate } = await req.json();

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: { landlordId: true, name: true }
    });

    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.userId,
        apartmentId,
        landlordId: apartment.landlordId,
        customerName,
        customerPhone,
        customerEmail,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        viewingDate: viewingDate ? new Date(viewingDate) : null,
        message,
      },
      include: {
        apartment: { select: { name: true, address: true, neighborhood: true } },
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    try {
      await pusherServer.trigger(`landlord-${apartment.landlordId}`, 'new-booking', {
        booking,
        message: `New booking for ${apartment.name}`
      });
      // Also notify admins
      await pusherServer.trigger('admin-channel', 'new-booking', { booking });
    } catch (e) {
      console.error('Pusher trigger failed:', e);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.userId },
      include: {
        apartment: {
          select: { name: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
