import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Home, Phone, Shield, Wifi, Car, ArrowLeft, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { VacancyBadge, UnitStatusBadge } from '@/components/ui/VacancyBadge';
import prisma from '@/lib/prisma';
import { formatPrice, getHouseTypeLabel, timeAgo } from '@/lib/utils';

async function getApartment(id: string) {
  return prisma.apartment.findFirst({
    where: { id, status: 'APPROVED' },
    include: {
      images: { orderBy: [{ isCover: 'desc' }] },
      units: { orderBy: { unitNumber: 'asc' } },
      landlord: { select: { id: true, name: true, phone: true, isVerified: true } },
    },
  });
}

const AMENITY_ICONS: Record<string, string> = {
  Water: '💧', Electricity: '⚡', WiFi: '📶', Parking: '🚗',
  Security: '🔒', CCTV: '📹', Balcony: '🏗️', Garden: '🌿',
  Laundry: '👕', Generator: '🔋', Elevator: '🛗', Gym: '💪',
};

export default async function ApartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = await getApartment(id).catch(() => null);

  if (!apartment) notFound();

  const vacantCount = apartment.units.filter(u => u.status === 'VACANT').length;
  const occupiedCount = apartment.units.filter(u => u.status === 'OCCUPIED').length;
  const reservedCount = apartment.units.filter(u => u.status === 'RESERVED').length;
  const coverImage = apartment.images.find(i => i.isCover)?.url
    || apartment.images[0]?.url
    || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-16">
        {/* Hero image */}
        <div className="relative h-72 md:h-96 bg-slate-200">
          <Image src={coverImage} alt={apartment.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />

          {/* Back button */}
          <Link href="/listings" className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          {/* Vacancy badge */}
          <div className="absolute top-4 right-4">
            <VacancyBadge vacantCount={vacantCount} totalUnits={apartment.totalUnits} size="lg" />
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white text-xs font-semibold mb-2">
              {getHouseTypeLabel(apartment.houseType)}
            </span>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white">{apartment.name}</h1>
            <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {apartment.address}, {apartment.neighborhood}, Narok
            </div>
          </div>
        </div>

        {/* Image gallery */}
        {apartment.images.length > 1 && (
          <div className="bg-slate-900 py-3 px-4">
            <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-1">
              {apartment.images.map(img => (
                <div key={img.id} className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden">
                  <Image src={img.url} alt="" fill className="object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price & Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-slate-500 text-sm">Monthly Rent</p>
                    <p className="font-display font-black text-3xl text-slate-900">
                      {formatPrice(apartment.pricePerMonth)}
                      <span className="text-slate-400 text-base font-normal">/month</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { v: apartment.totalUnits, l: 'Total', c: 'text-slate-600' },
                      { v: vacantCount, l: 'Vacant', c: 'text-red-500' },
                      { v: occupiedCount, l: 'Occupied', c: 'text-orange-500' },
                    ].map(({ v, l, c }) => (
                      <div key={l} className="bg-slate-50 rounded-xl p-3">
                        <p className={`font-display font-bold text-2xl ${c}`}>{v}</p>
                        <p className="text-xs text-slate-400">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                <h2 className="font-display font-bold text-lg text-slate-900 mb-3">About this property</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{apartment.description}</p>
              </div>

              {/* Amenities */}
              {apartment.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                  <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {apartment.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700">
                        <span>{AMENITY_ICONS[a] || '✓'}</span>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Units */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg text-slate-900">All Units</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Vacant</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />Occupied</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Reserved</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {apartment.units.map(unit => (
                    <UnitStatusBadge key={unit.id} status={unit.status} unitNumber={unit.unitNumber} />
                  ))}
                </div>
              </div>

              {/* Map */}
              {apartment.latitude && apartment.longitude && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                  <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Location</h2>
                  <div className="h-56 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                    <a
                      href={`https://maps.google.com/?q=${apartment.latitude},${apartment.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <MapPin className="w-8 h-8" />
                      <span className="text-sm font-medium">Open in Google Maps</span>
                      <span className="text-xs text-slate-400">{apartment.address}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Contact landlord */}
              <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 sticky top-20">
                <h3 className="font-display font-bold text-slate-900 mb-4">Contact Landlord</h3>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {apartment.landlord.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{apartment.landlord.name}</p>
                    <div className="flex items-center gap-1">
                      {apartment.landlord.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className="text-xs text-slate-400">
                        {apartment.landlord.isVerified ? 'Verified landlord' : 'Landlord'}
                      </span>
                    </div>
                  </div>
                </div>

                {apartment.landlord.phone && (
                  <a
                    href={`tel:${apartment.landlord.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-neon-indigo transition-shadow mb-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Landlord
                  </a>
                )}
                <a
                  href={`https://wa.me/${apartment.landlord.phone?.replace(/\D/g, '')}?text=Hi, I saw your listing on RentLink Narok: ${apartment.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                >
                  💬 WhatsApp
                </a>

                {/* Quick info */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Listed</span>
                    <span className="text-slate-700 font-medium">{timeAgo(apartment.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Updated</span>
                    <span className="text-slate-700 font-medium">{timeAgo(apartment.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Location</span>
                    <span className="text-slate-700 font-medium">{apartment.neighborhood}</span>
                  </div>
                </div>

                {vacantCount > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5">
                      <span className="relative flex w-2 h-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
                      </span>
                      {vacantCount} unit{vacantCount > 1 ? 's' : ''} available now!
                    </p>
                    <p className="text-red-500 text-xs mt-0.5">Contact landlord quickly — vacancies fill fast</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
