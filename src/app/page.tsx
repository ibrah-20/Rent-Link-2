import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Home, Shield, Zap, TrendingUp, Users } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { ApartmentCard, ApartmentCardSkeleton } from '@/components/apartments/ApartmentCard';
import prisma from '@/lib/prisma';

async function getStats() {
  const [totalApartments, totalUnits, vacantUnits] = await Promise.all([
    prisma.apartment.count({ where: { status: 'APPROVED' } }),
    prisma.unit.count(),
    prisma.unit.count({ where: { status: 'VACANT' } }),
  ]);
  return { totalApartments, totalUnits, vacantUnits };
}

async function getVacantListings() {
  return prisma.apartment.findMany({
    where: {
      status: 'APPROVED',
      units: { some: { status: 'VACANT' } },
    },
    take: 6,
    orderBy: { updatedAt: 'desc' },
    include: {
      images: { where: { isCover: true }, take: 1 },
      units: true,
    },
  });
}

async function getMacedoniaListings() {
  return prisma.apartment.findMany({
    where: {
      status: 'APPROVED',
      neighborhood: 'Macedonia',
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { where: { isCover: true }, take: 1 },
      units: true,
    },
  });
}

async function getAllListings() {
  return prisma.apartment.findMany({
    where: { status: 'APPROVED' },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { where: { isCover: true }, take: 1 },
      units: true,
    },
  });
}

export default async function HomePage() {
  const [stats, vacantListings, macedoniaListings, allListings] = await Promise.all([
    getStats().catch(() => ({ totalApartments: 0, totalUnits: 0, vacantUnits: 0 })),
    getVacantListings().catch(() => []),
    getMacedoniaListings().catch(() => []),
    getAllListings().catch(() => []),
  ]);

  const enriched = (listings: any[]) =>
    listings.map(a => ({ ...a, vacantCount: a.units.filter((u: any) => u.status === 'VACANT').length }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden noise-overlay">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-violet-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
              </span>
              <span className="text-white/90 text-xs font-medium">
                {stats.vacantUnits} units available right now in Narok
              </span>
            </div>

            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-6 tracking-tighter">
              Find Your{' '}
              <span className="text-cyan-400 inline-block">
                Perfect Home
              </span>
              <br />
              in Narok
            </h1>

            <p className="text-slate-300 text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
              Real-time rental listings across Gate A, B, C, D, Macedonia, and all Narok neighborhoods.
              Vacant rooms highlighted instantly. 🔴
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Link
                href="/listings"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-neon-indigo hover:scale-105 transition-all"
              >
                Browse Listings
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/listings?vacantOnly=true"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
                </span>
                Vacant Now
              </Link>
              <Link
                href="/map"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <MapPin className="w-4 h-4" />
                Map View
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-sm">
              {[
                { value: stats.totalApartments, label: 'Apartments', icon: Home },
                { value: stats.totalUnits, label: 'Total Units', icon: TrendingUp },
                { value: stats.vacantUnits, label: 'Vacant Now', icon: Zap, highlight: true },
              ].map(({ value, label, icon: Icon, highlight }) => (
                <div key={label} className={`rounded-2xl p-3 ${highlight ? 'bg-red-500/20 border border-red-400/30' : 'bg-white/10 border border-white/10'} backdrop-blur-sm text-center`}>
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${highlight ? 'text-red-400' : 'text-slate-300'}`} />
                  <p className="font-display font-bold text-white text-xl">{value}</p>
                  <p className="text-slate-400 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/40 text-xs">Scroll to explore</span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Vacant Feed Section */}
      {vacantListings.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-3 h-3 bg-red-500" />
                </span>
                <span className="text-red-500 text-sm font-bold uppercase tracking-wide">Live Vacancy Feed</span>
              </div>
              <h2 className="font-display font-bold text-3xl text-slate-900">
                Available Right Now
              </h2>
            </div>
            <Link href="/listings?vacantOnly=true" className="hidden sm:flex items-center gap-1 text-indigo-600 text-sm font-semibold hover:gap-2 transition-all">
              See all vacancies <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enriched(vacantListings).map(apt => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
        </section>
      )}

      {/* Macedonia Section */}
      {macedoniaListings.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 my-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-1">Macedonia, Narok</p>
              <h2 className="font-display font-bold text-3xl text-slate-900">
                Verified Apartments in Macedonia
              </h2>
            </div>
            <Link href="/listings?neighborhood=Macedonia" className="hidden sm:flex items-center gap-1 text-indigo-600 text-sm font-semibold hover:gap-2 transition-all">
              Explore Macedonia <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {enriched(macedoniaListings).map(apt => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
        </section>
      )}

      {/* All Listings */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-1">All Properties</p>
            <h2 className="font-display font-bold text-3xl text-slate-900">
              Every Listing in Narok
            </h2>
          </div>
          <Link href="/listings" className="hidden sm:flex items-center gap-1 text-indigo-600 text-sm font-semibold hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {allListings.length > 0
            ? enriched(allListings).map(apt => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))
            : Array.from({ length: 8 }).map((_, i) => <ApartmentCardSkeleton key={i} />)
          }
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Why RentLink Narok?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              The most trusted platform for finding rentals in Narok, Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Real-Time Vacancies',
                desc: 'See vacant rooms instantly as landlords update availability. No more stale listings.',
                gradient: 'from-red-500 to-orange-500',
              },
              {
                icon: Shield,
                title: 'Verified Listings',
                desc: 'Every apartment is reviewed and approved by our admin team before going live.',
                gradient: 'from-indigo-500 to-violet-500',
              },
              {
                icon: MapPin,
                title: 'Map Integration',
                desc: 'Find apartments on Google Maps with exact locations and directions.',
                gradient: 'from-cyan-500 to-sky-500',
              },
            ].map(f => (
              <div key={f.title} className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landlord CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-8 md:p-12 text-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent" />
            <Users className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-4">
              Own Property in Narok?
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-xl mx-auto">
              List your apartments for free. Reach thousands of tenants searching for homes in Narok right now.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/auth/register?role=LANDLORD"
                className="px-8 py-3.5 rounded-2xl bg-white text-indigo-600 font-bold text-sm hover:scale-105 transition-all shadow-lg"
              >
                List Your Property Free
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3.5 rounded-2xl bg-white/10 border border-white/30 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                <Home className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold text-white">RentLink Narok</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} RentLink Narok. Built for Narok, Kenya 🇰🇪</p>
            <div className="flex gap-4 text-sm">
              <Link href="/listings" className="hover:text-white transition-colors">Listings</Link>
              <Link href="/map" className="hover:text-white transition-colors">Map</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
