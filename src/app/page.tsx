import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Home, Shield, Zap, TrendingUp, Users, Plus, Search } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { ApartmentCard, ApartmentCardSkeleton } from '@/components/apartments/ApartmentCard';
import prisma from '@/lib/prisma';
import { VacancyFeed } from '@/components/home/VacancyFeed';

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
    take: 12,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-slate-900 overflow-hidden noise-overlay">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <div className="max-w-4xl">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500" />
                </span>
                <span className="text-white/80 text-xs font-medium">
                  {stats.vacantUnits} units available right now in Narok
                </span>
              </div>

              <h1 className="font-display font-black text-7xl md:text-8xl lg:text-9xl text-white leading-[0.9] mb-12 tracking-tighter uppercase italic">
                Find Your <br />
                <span className="text-cyan-400">Perfect <br /> Home</span> <br />
                in Narok
              </h1>

              <p className="text-slate-400 text-lg max-w-xl mb-12 leading-relaxed font-medium">
                Real-time rental listings across Gate A, B, C, D, Macedonia, and all Narok neighborhoods. Vacant rooms highlighted instantly. 🔴
              </p>

              {/* CTA buttons / Search Bar */}
              <div className="max-w-xl mb-16">
                <form 
                  action="/listings"
                  method="GET"
                  className="flex items-center p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group focus-within:border-indigo-500/50 transition-all shadow-2xl"
                >
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text" 
                      name="neighborhood"
                      placeholder="Search by neighborhood (e.g. Macedonia)"
                      className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 text-sm font-medium py-3"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all flex items-center gap-2"
                  >
                    Browse
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Live Feed Section - Moved below */}
              <div className="max-w-2xl mt-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/10 rounded-[40px] blur-3xl" />
                  <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="text-white font-bold uppercase tracking-tighter text-sm">Live Feed</h3>
                      </div>
                      <span className="text-slate-500 text-[10px] font-mono">Narok v2.0</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vacantListings.slice(0, 4).map((apt: any) => (
                        <div 
                          key={apt.id}
                          className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-bold text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">
                              {apt.name}
                            </h4>
                            <span className="text-emerald-400 font-bold text-xs">KSh {apt.pricePerMonth}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-medium border border-white/5 uppercase">
                              {apt.neighborhood}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium italic">
                              Updated {new Date(apt.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link href="/listings?vacantOnly=true" className="mt-8 block text-center py-4 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-sm hover:bg-indigo-500/30 transition-all">
                      View All Live Vacancies
                    </Link>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Horizontal Vacancy Feed */}
      <section className="py-12 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  Trending Now
                </h2>
                <p className="text-slate-500 text-sm">Most recently updated vacancies in town</p>
              </div>
            </div>
            <Link href="/listings?vacantOnly=true" className="text-sm font-bold text-indigo-600 dark:text-cyan-400 hover:underline">
              See more
            </Link>
          </div>
          <VacancyFeed />
        </div>
      </section>

      {/* Featured Neighborhoods */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="font-display font-black text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight">
              Explore Neighborhoods
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Find the best hostels and apartments in your preferred area of Narok town.
            </p>
          </div>
          <div className="flex gap-2">
             {['Gate A', 'Gate B', 'Gate C', 'Macedonia', 'Town'].map(loc => (
               <button key={loc} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:border-indigo-500 dark:hover:border-cyan-500 transition-all">
                 {loc}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {enriched(allListings).slice(0, 8).map((apt) => (
            <ApartmentCard key={apt.id} apartment={apt} />
          ))}
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
