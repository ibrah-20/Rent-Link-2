import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const apartment = await prisma.apartment.findUnique({ where: { id: params.id } });
    if (!apartment) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (user.role !== 'ADMIN' && apartment.landlordId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { images } = body as { images: Array<{ base64: string; isCover?: boolean }> };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ success: false, error: 'No images provided' }, { status: 400 });
    }

    const uploaded = await Promise.all(
      images.map(async (img, idx) => {
        const { url, publicId } = await uploadImage(img.base64, `rentlink-narok/${params.id}`);
        return prisma.apartmentImage.create({
          data: {
            url,
            publicId,
            isCover: img.isCover || idx === 0,
            apartmentId: params.id,
          },
        });
      })
    );

    return NextResponse.json({ success: true, data: uploaded }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
