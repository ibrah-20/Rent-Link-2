import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RentLink Narok database...');

  // Create admin
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentlink.co.ke' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@rentlink.co.ke',
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Create landlords
  const landlordHash = await bcrypt.hash('landlord123', 12);
  const landlord1 = await prisma.user.upsert({
    where: { email: 'john@example.co.ke' },
    update: {},
    create: {
      name: 'John Kipchoge',
      email: 'john@example.co.ke',
      passwordHash: landlordHash,
      phone: '+254712345678',
      role: 'LANDLORD',
      isVerified: true,
    },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: 'mary@example.co.ke' },
    update: {},
    create: {
      name: 'Mary Wanjiku',
      email: 'mary@example.co.ke',
      passwordHash: landlordHash,
      phone: '+254723456789',
      role: 'LANDLORD',
      isVerified: true,
    },
  });

  // Macedonia Verified Apartments
  const macedoniaApartments = [
    {
      name: 'Fairview Apartments',
      description: 'Premium living in the heart of Macedonia. Fairview offers modern apartments with excellent finishing, consistent water supply, and a secure environment.',
      houseType: 'BEDSITTER' as const,
      totalUnits: 15,
      pricePerMonth: 7000,
      neighborhood: 'Macedonia',
      address: 'Macedonia Main Rd, Narok',
      latitude: -1.093924,
      longitude: 35.84751,
      amenities: ['Reliable internet', 'Water available', 'Good security', 'CCTV'],
      landlordId: landlord1.id,
      units: [
        { unitNumber: 'F1', status: 'VACANT' as const },
        { unitNumber: 'F2', status: 'OCCUPIED' as const },
        { unitNumber: 'F3', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Millennium Apartments',
      description: 'Budget-friendly yet comfortable rooms in Macedonia. Close to essential utilities and transport.',
      houseType: 'SINGLE_ROOM' as const,
      totalUnits: 20,
      pricePerMonth: 5500,
      neighborhood: 'Macedonia',
      address: 'Millennium Lane, Macedonia',
      latitude: -1.0941,
      longitude: 35.8478,
      amenities: ['Basic utilities', 'Water', 'Security'],
      landlordId: landlord2.id,
      units: [
        { unitNumber: 'M1', status: 'OCCUPIED' as const },
        { unitNumber: 'M2', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Singapore Apartments',
      description: 'Standard housing with a clean environment and reliable services. Perfect for students and small families.',
      houseType: 'BEDSITTER' as const,
      totalUnits: 12,
      pricePerMonth: 6200,
      neighborhood: 'Macedonia',
      address: 'Singapore Court, Macedonia',
      latitude: -1.0937,
      longitude: 35.8472,
      amenities: ['Standard housing', 'Water', 'Security'],
      landlordId: landlord1.id,
      units: [
        { unitNumber: 'S1', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Kwalala Apartments',
      description: 'Secure and standard rooms offering peace of mind and convenience.',
      houseType: 'SINGLE_ROOM' as const,
      totalUnits: 10,
      pricePerMonth: 7000,
      neighborhood: 'Macedonia',
      address: 'Kwalala Close, Macedonia',
      latitude: -1.0935,
      longitude: 35.8480,
      amenities: ['Secure', 'Standard rooms', 'Water'],
      landlordId: landlord2.id,
      units: [
        { unitNumber: 'K1', status: 'VACANT' as const },
        { unitNumber: 'K2', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Ulitenda Apartments',
      description: 'Well-maintained apartments with consistent water and electricity supply.',
      houseType: 'BEDSITTER' as const,
      totalUnits: 18,
      pricePerMonth: 6000,
      neighborhood: 'Macedonia',
      address: 'Ulitenda Rd, Macedonia',
      latitude: -1.0943,
      longitude: 35.8471,
      amenities: ['Water', 'Electricity', 'Security'],
      landlordId: landlord1.id,
      units: [
        { unitNumber: 'U1', status: 'OCCUPIED' as const },
        { unitNumber: 'U2', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Nyangi Apartments',
      description: 'Basic but comfortable rooms at an affordable price point.',
      houseType: 'SINGLE_ROOM' as const,
      totalUnits: 25,
      pricePerMonth: 5200,
      neighborhood: 'Macedonia',
      address: 'Nyangi Way, Macedonia',
      latitude: -1.0945,
      longitude: 35.8485,
      amenities: ['Basic rooms', 'Water'],
      landlordId: landlord2.id,
      units: [
        { unitNumber: 'N1', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Manuela Apartments',
      description: 'Decent security and reliable water supply make Manuela a great choice for long-term stays.',
      houseType: 'BEDSITTER' as const,
      totalUnits: 14,
      pricePerMonth: 6500,
      neighborhood: 'Macedonia',
      address: 'Manuela Estate, Macedonia',
      latitude: -1.0938,
      longitude: 35.8476,
      amenities: ['Decent security', 'Water', 'CCTV'],
      landlordId: landlord1.id,
      units: [
        { unitNumber: 'MAN1', status: 'OCCUPIED' as const },
        { unitNumber: 'MAN2', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Sunrise Apartments',
      description: 'Modern units with internet and consistent water supply.',
      houseType: 'BEDSITTER' as const,
      totalUnits: 16,
      pricePerMonth: 6000,
      neighborhood: 'Macedonia',
      address: 'Sunrise Ave, Macedonia',
      latitude: -1.0940,
      longitude: 35.8474,
      amenities: ['Internet', 'Water', 'Security'],
      landlordId: landlord2.id,
      units: [
        { unitNumber: 'SUN1', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Greenfield Apartments',
      description: 'A secure compound with green spaces, perfect for those seeking a quiet home.',
      houseType: 'ONE_BEDROOM' as const,
      totalUnits: 8,
      pricePerMonth: 7000,
      neighborhood: 'Macedonia',
      address: 'Greenfield Rd, Macedonia',
      latitude: -1.0936,
      longitude: 35.8479,
      amenities: ['Secure compound', 'Water', 'Electricity'],
      landlordId: landlord1.id,
      units: [
        { unitNumber: 'G1', status: 'VACANT' as const },
      ],
    },
    {
      name: 'Royal Macedonia Apartments',
      description: 'Premium housing with high-end amenities and top-notch security.',
      houseType: 'ONE_BEDROOM' as const,
      totalUnits: 10,
      pricePerMonth: 6800,
      neighborhood: 'Macedonia',
      address: 'Royal Way, Macedonia',
      latitude: -1.0942,
      longitude: 35.8481,
      amenities: ['Water', 'Internet', 'Security', 'CCTV'],
      landlordId: landlord2.id,
      units: [
        { unitNumber: 'R1', status: 'VACANT' as const },
        { unitNumber: 'R2', status: 'OCCUPIED' as const },
      ],
    },
  ];

  for (const apt of macedoniaApartments) {
    const { units, ...aptData } = apt;
    const existing = await prisma.apartment.findFirst({
      where: { name: apt.name },
    });

    if (!existing) {
      await prisma.apartment.create({
        data: {
          ...aptData,
          status: 'APPROVED',
          images: {
            create: [{
              url: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1522708323590-d24dbb6b0267' : '1560448204-e02f11c3d0e2'}?w=800&q=80`,
              isCover: true,
            }],
          },
          units: {
            create: units.map(u => ({ ...u, updatedAt: new Date() })),
          },
        },
      });
      console.log(`✅ Created: ${apt.name}`);
    } else {
      await prisma.apartment.update({
        where: { id: existing.id },
        data: {
          latitude: apt.latitude,
          longitude: apt.longitude,
          address: apt.address,
        },
      });
      console.log(`🆙 Updated coordinates: ${apt.name}`);
    }
  }

  console.log('\n✨ Seed complete!');
  console.log('👤 Admin: admin@rentlink.co.ke / admin123');
  console.log('🏠 Landlord 1: john@example.co.ke / landlord123');
  console.log('🏠 Landlord 2: mary@example.co.ke / landlord123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
