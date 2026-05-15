import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(req);
    if (!requireRole(user, 'LANDLORD', 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await req.json();

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { apartment: { include: { units: true } } }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existingBooking.landlordId !== user?.userId && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        apartment: { select: { name: true, totalUnits: true } }
      }
    });

    // Vacancy logic
    if (status === 'APPROVED' && existingBooking.status !== 'APPROVED') {
      // Find a vacant unit and mark it reserved/occupied
      const vacantUnit = existingBooking.apartment.units.find(u => u.status === 'VACANT');
      if (vacantUnit) {
        await prisma.unit.update({
          where: { id: vacantUnit.id },
          data: { status: 'OCCUPIED' }
        });
      }
    }

    // Trigger pusher events
    try {
      await pusherServer.trigger(`user-${updatedBooking.userId}`, 'booking-update', {
        booking: updatedBooking
      });
      // Trigger global refresh for vacancy counts if needed
      await pusherServer.trigger('public-updates', 'vacancy-changed', {
        apartmentId: existingBooking.apartmentId
      });
    } catch (e) {
      console.error('Pusher error:', e);
    }

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
