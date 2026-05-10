'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { NEIGHBORHOODS, HouseType, HOUSE_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const [filters, setFilters] = useState({
    houseType: searchParams.get('houseType') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    vacantOnly: searchParams.get('vacantOnly') === 'true',
  });

  function applyFilters() {
    const params = new URLSearchParams();
    if (filters.houseType) params.set('houseType', filters.houseType);
    if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.vacantOnly) params.set('vacantOnly', 'true');
    router.push(`/listings?${params.toString()}`);
  }

  function clearFilters() {
    setFilters({ houseType: '', neighborhood: '', minPrice: '', maxPrice: '', vacantOnly: false });
    router.push('/listings');
  }

  const hasFilters = Object.values(filters).some(v => v !== '' && v !== false);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4">
      {/* Search bar row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filters.neighborhood}
            onChange={e => setFilters(p => ({ ...p, neighborhood: e.target.value }))}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 text-slate-700 appearance-none"
          >
            <option value="">All Neighborhoods</option>
            {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors',
            expanded || hasFilters
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold shadow-md hover:shadow-neon-indigo transition-all"
        >
          Search
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* House type */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Type</label>
            <select
              value={filters.houseType}
              onChange={e => setFilters(p => ({ ...p, houseType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
            >
              <option value="">All Types</option>
              {Object.entries(HOUSE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Min price */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Min Price (KES)</label>
            <input
              type="number"
              placeholder="e.g. 3000"
              value={filters.minPrice}
              onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
            />
          </div>

          {/* Max price */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Max Price (KES)</label>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={filters.maxPrice}
              onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
            />
          </div>

          {/* Vacant only */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-slate-50 w-full">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.vacantOnly}
                  onChange={e => setFilters(p => ({ ...p, vacantOnly: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-checked:bg-red-500 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Vacant only</p>
                <p className="text-xs text-slate-400">Show available</p>
              </div>
            </label>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="col-span-full flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
