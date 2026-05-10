import { Suspense } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { ApartmentCard, ApartmentCardSkeleton } from '@/components/apartments/ApartmentCard';
import { SearchFilters } from '@/components/apartments/SearchFilters';
import prisma from '@/lib/prisma';
import { HouseType } from '@/types';

interface SearchParams {
  houseType?: string;
  neighborhood?: string;
  minPrice?: string;
  maxPrice?: string;
  vacantOnly?: string;
  page?: string;
}

async function getApartments(params: SearchParams) {
  const page = parseInt(params.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: 'APPROVED' };
  if (params.houseType) where.houseType = params.houseType;
  if (params.neighborhood) where.neighborhood = { contains: params.neighborhood, mode: 'insensitive' };
  if (params.minPrice || params.maxPrice) {
    where.pricePerMonth = {};
    if (params.minPrice) (where.pricePerMonth as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.pricePerMonth as Record<string, number>).lte = parseFloat(params.maxPrice);
  }
  if (params.vacantOnly === 'true') {
    where.units = { some: { status: 'VACANT' } };
  }

  const [apartments, total] = await Promise.all([
    prisma.apartment.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        images: { where: { isCover: true }, take: 1 },
        units: true,
      },
    }),
    prisma.apartment.count({ where }),
  ]);

  return {
    apartments: apartments.map(a => ({
      ...a,
      vacantCount: a.units.filter(u => u.status === 'VACANT').length,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { apartments, total, pages, page } = await getApartments(searchParams).catch(() => ({
    apartments: [],
    total: 0,
    pages: 0,
    page: 1,
  }));

  const isVacantFeed = searchParams.vacantOnly === 'true';
  const hasFilters = Object.values(searchParams).some(v => v);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-16">
        {/* Page header */}
        <div className={`py-10 px-4 sm:px-6 lg:px-8 ${isVacantFeed
          ? 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-900'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
          }`}>
          <div className="max-w-7xl mx-auto">
            {isVacantFeed && (
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-3 h-3 bg-red-500" />
                </span>
                <span className="text-red-400 text-sm font-bold uppercase tracking-wide">Live Feed</span>
              </div>
            )}
            <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-2">
              {isVacantFeed ? 'Vacant Units Right Now' : 'All Listings in Narok'}
            </h1>
            <p className="text-slate-400">
              {total} {total === 1 ? 'property' : 'properties'} found
              {searchParams.neighborhood && ` in ${searchParams.neighborhood}`}
              {searchParams.houseType && ` · ${searchParams.houseType.replace(/_/g, ' ')}`}
            </p>
          </div>
        </div>

        {/* Search filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <Suspense>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Results grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {apartments.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-display font-bold text-slate-900 text-xl mb-2">No listings found</h3>
              <p className="text-slate-500 text-sm">
                {hasFilters ? 'Try adjusting your filters' : 'No approved listings yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {apartments.map(apt => (
                  <ApartmentCard key={apt.id} apartment={apt} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <a
                      key={p}
                      href={`/listings?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${p === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
