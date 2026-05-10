'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, LogOut, Edit, Eye, Trash2, TrendingUp, Building2, DoorOpen } from 'lucide-react';
import { Apartment } from '@/types';
import { formatPrice, getHouseTypeLabel } from '@/lib/utils';
import { VacancyBadge } from '@/components/ui/VacancyBadge';

export default function LandlordDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [apartments, setApartments] = useState<(Apartment & { vacantCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'LANDLORD' && u.role !== 'ADMIN') { router.push('/auth/login'); return; }
    setUser(u);
    fetchApartments(token);
  }, []);

  async function fetchApartments(token: string) {
    setLoading(true);
    const res = await fetch('/api/apartments?myListings=true', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setApartments(data.data);
    setLoading(false);
  }

  function logout() {
    localStorage.clear();
    router.push('/');
  }

  const filtered = apartments.filter(a =>
    tab === 'all' ? true : tab === 'pending' ? a.status === 'PENDING' : a.status === 'APPROVED'
  );

  const stats = {
    total: apartments.length,
    approved: apartments.filter(a => a.status === 'APPROVED').length,
    pending: apartments.filter(a => a.status === 'PENDING').length,
    vacant: apartments.reduce((sum, a) => sum + (a.vacantCount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar + Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold">RentLink <span className="text-cyan-400">Narok</span></span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm hidden sm:block">{user?.name}</span>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display font-black text-2xl text-slate-900">Landlord Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage your property listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: stats.total, icon: Building2, color: 'from-indigo-500 to-violet-500' },
            { label: 'Live Listings', value: stats.approved, icon: TrendingUp, color: 'from-emerald-500 to-cyan-500' },
            { label: 'Pending Review', value: stats.pending, icon: Eye, color: 'from-orange-400 to-amber-500' },
            { label: 'Vacant Units', value: stats.vacant, icon: DoorOpen, color: 'from-red-500 to-rose-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-display font-black text-2xl text-slate-900">{s.value}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex gap-1">
              {(['all', 'approved', 'pending'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Link
              href="/dashboard/landlord/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-semibold shadow-sm hover:scale-105 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Listing
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-display font-semibold text-slate-500">No listings yet</p>
              <Link href="/dashboard/landlord/new" className="mt-3 inline-flex items-center gap-1 text-indigo-600 text-sm font-medium">
                <Plus className="w-4 h-4" /> Add your first listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-slate-900 text-sm truncate">{apt.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${apt.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : apt.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{apt.neighborhood}</span>
                      <span>·</span>
                      <span>{getHouseTypeLabel(apt.houseType)}</span>
                      <span>·</span>
                      <span>{formatPrice(apt.pricePerMonth)}/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <VacancyBadge vacantCount={apt.vacantCount || 0} totalUnits={apt.totalUnits} size="sm" />
                    <div className="flex items-center gap-1">
                      <Link href={`/listings/${apt.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/dashboard/landlord/edit/${apt.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
