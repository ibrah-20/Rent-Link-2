'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, CheckCircle, XCircle, Eye, Building2, Users, Clock, TrendingUp } from 'lucide-react';
import { formatPrice, getHouseTypeLabel, timeAgo } from '@/lib/utils';

interface AdminApartment {
  id: string;
  name: string;
  houseType: string;
  pricePerMonth: number;
  neighborhood: string;
  status: string;
  createdAt: string;
  landlord: { id: string; name: string; email: string; phone?: string };
  images: { url: string }[];
  _count: { units: number };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [apartments, setApartments] = useState<AdminApartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'ADMIN') { router.push('/auth/login'); return; }
    fetchApartments(token, tab);
  }, [tab]);

  async function fetchApartments(token: string, status: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/apartments?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setApartments(data.data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const token = localStorage.getItem('token');
    if (!token) return;
    setActionLoading(id);
    await fetch(`/api/apartments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setApartments(p => p.filter(a => a.id !== id));
    setActionLoading(null);
  }

  const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  apartments.forEach(a => { if (counts[a.status as keyof typeof counts] !== undefined) counts[a.status as keyof typeof counts]++; });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold">Admin <span className="text-violet-400">Panel</span></span>
            </Link>
            <button onClick={() => { localStorage.clear(); router.push('/'); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display font-black text-2xl text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Review and moderate all property listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending Review', value: apartments.filter(a => a.status === 'PENDING').length, icon: Clock, color: 'from-orange-400 to-amber-500' },
            { label: 'Approved Live', value: apartments.filter(a => a.status === 'APPROVED').length, icon: CheckCircle, color: 'from-emerald-500 to-cyan-500' },
            { label: 'Rejected', value: apartments.filter(a => a.status === 'REJECTED').length, icon: XCircle, color: 'from-red-500 to-rose-500' },
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

        {/* Listings table */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100">
          <div className="flex gap-1 p-4 border-b border-slate-100">
            {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${tab === t
                  ? t === 'PENDING' ? 'bg-orange-500 text-white'
                    : t === 'APPROVED' ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                  : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading listings...</div>
          ) : apartments.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No {tab.toLowerCase()} listings</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {apartments.map(apt => (
                <div key={apt.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-slate-900 text-sm">{apt.name}</p>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs">
                          {getHouseTypeLabel(apt.houseType as Parameters<typeof getHouseTypeLabel>[0])}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span>{apt.neighborhood}, Narok</span>
                        <span>·</span>
                        <span>{formatPrice(apt.pricePerMonth)}/mo</span>
                        <span>·</span>
                        <span>{apt._count.units} units</span>
                        <span>·</span>
                        <span>{timeAgo(apt.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {apt.landlord.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{apt.landlord.name}</p>
                          <p className="text-xs text-slate-400">{apt.landlord.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/listings/${apt.id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {apt.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'APPROVED')}
                            disabled={actionLoading === apt.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, 'REJECTED')}
                            disabled={actionLoading === apt.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {apt.status === 'APPROVED' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'REJECTED')}
                          disabled={actionLoading === apt.id}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {apt.status === 'REJECTED' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'APPROVED')}
                          disabled={actionLoading === apt.id}
                          className="px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-600 text-xs font-semibold hover:bg-emerald-50 transition-colors"
                        >
                          Re-approve
                        </button>
                      )}
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
