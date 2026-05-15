import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const reviews = await prisma.review.findMany({
      where: { apartmentId: id },
      include: {
        user: {
          select: { name: true, avatar: true, isVerified: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { rating, comment, security, water, internet, cleanliness, noise } = body;

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        security,
        water,
        internet,
        cleanliness,
        noise,
        userId: user.userId,
        apartmentId: id,
      },
    });

    // Update apartment average rating
    const reviews = await prisma.review.findMany({
      where: { apartmentId: id },
      select: { rating: true },
    });

    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await prisma.apartment.update({
      where: { id },
      data: {
        averageRating,
        reviewCount: reviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
