import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Home, Phone, Shield, Wifi, Car, ArrowLeft, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { motion } from 'framer-motion';
import { VacancyBadge, UnitStatusBadge } from '@/components/ui/VacancyBadge';
import prisma from '@/lib/prisma';
import { formatPrice, getHouseTypeLabel, timeAgo } from '@/lib/utils';
import { FavoriteButton } from '@/components/apartments/FavoriteButton';
import { ReviewsSection } from '@/components/apartments/ReviewsSection';

import { LocationFeatures } from '@/components/apartments/LocationFeatures';
import { BookingForm } from '@/components/apartments/BookingForm';
import { ApartmentReels } from '@/components/apartments/ApartmentReels';

async function getApartment(id: string) {
  return prisma.apartment.findFirst({
    where: { id, status: 'APPROVED' },
    include: {
      images: { orderBy: [{ isCover: 'desc' }] },
      media: true,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />

      <div className="pt-20">
        {/* Hero image */}
        <div className="relative h-80 md:h-[500px] bg-slate-200 dark:bg-slate-900 mx-4 md:mx-8 rounded-[40px] overflow-hidden shadow-2xl">
          <Image src={coverImage} alt={apartment.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

          {/* Back button */}
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <Link href="/listings" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl text-white text-sm font-bold border border-white/20 hover:bg-white/20 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <FavoriteButton apartmentId={apartment.id} className="w-11 h-11 bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white/20" />
          </div>

          {/* Vacancy badge */}
          <div className="absolute top-8 right-8">
            <VacancyBadge vacantCount={vacantCount} totalUnits={apartment.totalUnits} size="lg" />
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-10 left-10 right-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-block px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold mb-4 uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                {getHouseTypeLabel(apartment.houseType)}
              </span>
              <h1 className="font-display font-black text-4xl md:text-6xl text-white mb-4 leading-[1.1] tracking-tighter">{apartment.name}</h1>
              <div className="flex items-center gap-2 text-white/90 text-lg font-medium">
                <MapPin className="w-5 h-5 text-cyan-400" />
                {apartment.address}, {apartment.neighborhood}, Narok
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-card border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-8">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Monthly Rent</p>
                    <p className="font-display font-black text-5xl text-slate-900 dark:text-white">
                      {formatPrice(apartment.pricePerMonth)}
                      <span className="text-slate-400 dark:text-slate-500 text-xl font-medium ml-1">/mo</span>
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { v: apartment.totalUnits, l: 'Total Units', c: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
                      { v: vacantCount, l: 'Vacant Now', c: 'bg-red-50 dark:bg-red-500/10 text-red-500' },
                      { v: occupiedCount, l: 'Occupied', c: 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' },
                    ].map(({ v, l, c }) => (
                      <div key={l} className={`${c} rounded-2xl p-4 min-w-[100px] text-center border border-current/10`}>
                        <p className="font-display font-black text-2xl">{v}</p>
                        <p className="text-[10px] font-bold uppercase opacity-70 tracking-tighter">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-card border border-slate-100 dark:border-slate-800">
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-4">About this property</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{apartment.description}</p>
              </div>

              {/* Amenities */}
              {apartment.amenities.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-card border border-slate-100 dark:border-slate-800">
                  <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">Premium Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {apartment.amenities.map(a => (
                      <div key={a} className="flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform">
                        <span className="text-xl">{AMENITY_ICONS[a] || '✓'}</span>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Units Table */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-card border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Unit Directory</h2>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Vacant</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" />Occupied</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {apartment.units.map(unit => (
                    <UnitStatusBadge key={unit.id} status={unit.status} unitNumber={unit.unitNumber} />
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-card border border-slate-100 dark:border-slate-800">
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">Location & Neighborhood</h2>
                <div className="mb-8">
                  <LocationFeatures neighborhood={apartment.neighborhood} />
                </div>
                {apartment.latitude && apartment.longitude && (
                  <div className="h-72 rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'contrast(1.1) brightness(0.9) grayscale(0.2)' }}
                      loading="lazy" 
                      allowFullScreen 
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${apartment.latitude},${apartment.longitude}`}
                    />
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors pointer-events-none" />
                    <a
                      href={`https://maps.google.com/?q=${apartment.latitude},${apartment.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-6 right-6 px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      Open in Maps
                    </a>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-card border border-slate-100 dark:border-slate-800">
                <ReviewsSection apartmentId={id} />
              </div>
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
                  href={`https://wa.me/${apartment.landlord.phone?.replace(/\D/g, '')}?text=Hello, I saw your apartment on RentLink Narok and I’m interested in: ${apartment.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  💬 WhatsApp Landlord
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

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Request a Viewing</h4>
                  <BookingForm apartmentId={id} />
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

              {/* Apartment Reels */}
              {apartment.media.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-800">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Apartment Reels</h3>
                  <ApartmentReels media={apartment.media} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
