'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Home, Star, ChevronRight } from 'lucide-react';
import { Apartment } from '@/types';
import { formatPrice, getHouseTypeLabel, timeAgo } from '@/lib/utils';
import { VacancyBadge } from '@/components/ui/VacancyBadge';
import { cn } from '@/lib/utils';
import { FavoriteButton } from './FavoriteButton';

interface ApartmentCardProps {
  apartment: Apartment & { vacantCount?: number };
  className?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

export function ApartmentCard({ apartment, className }: ApartmentCardProps) {
  const vacantCount = apartment.vacantCount ?? 0;
  const coverImage = apartment.images?.[0]?.url || FALLBACK_IMAGE;
  const hasVacancy = vacantCount > 0;

  return (
    <Link href={`/listings/${apartment.id}`} className="group block">
      <div className={cn(
        'relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden transition-all duration-300',
        'shadow-card hover:shadow-card-hover dark:shadow-none hover:-translate-y-1',
        'border border-slate-100 dark:border-slate-800',
        hasVacancy && 'ring-1 ring-red-200/60 dark:ring-red-500/20',
        className
      )}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={coverImage}
            alt={apartment.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

          {/* Vacancy badge overlay */}
          <div className="absolute top-3 left-3">
            <VacancyBadge vacantCount={vacantCount} totalUnits={apartment.totalUnits} size="sm" />
          </div>

          {/* House type badge */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
              {getHouseTypeLabel(apartment.houseType)}
            </span>
            <FavoriteButton apartmentId={apartment.id} className="p-1.5" />
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-display font-bold text-lg drop-shadow">
              {formatPrice(apartment.pricePerMonth)}
              <span className="text-white/70 text-xs font-normal">/mo</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
              {apartment.name}
            </h3>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-cyan-400 shrink-0 transition-colors mt-0.5" />
          </div>

          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{apartment.neighborhood}, Narok</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Home className="w-3 h-3" />
                <span>{apartment.totalUnits} units</span>
              </div>
              {hasVacancy && (
                <div className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {vacantCount} vacant
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(apartment.createdAt)}</span>
          </div>
        </div>

        {/* Vacant glow effect */}
        {hasVacancy && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-red-400 via-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        )}
      </div>
    </Link>
  );
}

export function ApartmentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-3" />
        <div className="flex justify-between">
          <div className="h-3 skeleton rounded w-1/4" />
          <div className="h-3 skeleton rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
