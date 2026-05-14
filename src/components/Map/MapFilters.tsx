'use client';

import { Search, MapPin, Filter, DollarSign, Home } from 'lucide-react';

export function MapFilters() {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search area..." 
          className="pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-48 transition-all"
        />
      </div>

      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-all">
        <Filter className="w-4 h-4" />
        Filters
      </button>

      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all">
        <MapPin className="w-4 h-4" />
        Near Me
      </button>
    </div>
  );
}
