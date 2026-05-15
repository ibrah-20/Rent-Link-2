'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, CheckCircle, XCircle, Eye, Building2, Clock, CalendarDays } from 'lucide-react';
import { formatPrice, getHouseTypeLabel, timeAgo } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher-client';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [apartments, setApartments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<'listings' | 'bookings'>('listings');
  const [listingTab, setListingTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [bookingTab, setBookingTab] = useState<'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED'>('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!stored || !token) { router.push('/auth/login'); return; }
      const u = JSON.parse(stored);
      if (!u || typeof u !== 'object') { router.push('/auth/login'); return; }
      fetchData(token);

      const channel = pusherClient.subscribe('admin-channel');
      channel.bind('new-booking', (data: any) => {
        toast.success(`New booking alert: ${data.booking.apartment?.name || 'an apartment'}`);
        setBookings(prev => [data.booking, ...prev]);
      });

      return () => pusherClient.unsubscribe('admin-channel');
    } catch (e) {
      console.error('Auth error:', e);
      router.push('/auth/login');
    }
  }, []);

  async function fetchData(token: string) {
    setLoading(true);
    try {
      const [aptRes, bookRes] = await Promise.all([
        fetch('/api/admin/apartments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (!aptRes.ok || !bookRes.ok) throw new Error('Failed to fetch data');

      const aptData = await aptRes.json();
      const bookData = await bookRes.json();
      if (aptData.success) setApartments(aptData.data);
      if (bookData.success) setBookings(bookData.data);
    } catch (e) {
      console.error('Fetch error:', e);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  async function updateListingStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const token = localStorage.getItem('token');
    setActionLoading(id);
    await fetch(`/api/apartments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setApartments(p => p.map(a => a.id === id ? { ...a, status } : a));
    setActionLoading(null);
  }

  async function updateBookingStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    setActionLoading(id);
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
    setActionLoading(null);
  }

  const filteredListings = apartments.filter(a => a.status === listingTab);
  const filteredBookings = bookings.filter(b => b.status === bookingTab);

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Review properties and monitor platform bookings</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
            <button onClick={() => setMainTab('listings')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mainTab === 'listings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Properties</button>
            <button onClick={() => setMainTab('bookings')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mainTab === 'bookings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Bookings</button>
          </div>
        </div>

        {mainTab === 'listings' ? (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100">
            <div className="flex gap-1 p-4 border-b border-slate-100">
              {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(t => (
                <button key={t} onClick={() => setListingTab(t)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${listingTab === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
              ))}
            </div>
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading listings...</div>
            ) : filteredListings.length === 0 ? (
              <div className="p-12 text-center"><Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400">No {listingTab.toLowerCase()} listings</p></div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredListings.map(apt => (
                  <div key={apt.id} className="p-4 hover:bg-slate-50/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 text-sm">{apt.name}</p>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs">{getHouseTypeLabel(apt.houseType)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                          <span>{apt.neighborhood}</span>·<span>{formatPrice(apt.pricePerMonth)}/mo</span>·<span>{timeAgo(apt.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-500">Landlord: <span className="font-semibold">{apt.landlord?.name}</span> ({apt.landlord?.email})</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/listings/${apt.id}`} className="p-2 text-slate-400 hover:text-indigo-600"><Eye className="w-4 h-4" /></Link>
                        {apt.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateListingStatus(apt.id, 'APPROVED')} className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">Approve</button>
                            <button onClick={() => updateListingStatus(apt.id, 'REJECTED')} className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Reject</button>
                          </>
                        )}
                        {apt.status === 'APPROVED' && <button onClick={() => updateListingStatus(apt.id, 'REJECTED')} className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50">Suspend</button>}
                        {apt.status === 'REJECTED' && <button onClick={() => updateListingStatus(apt.id, 'APPROVED')} className="px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-600 text-xs font-semibold hover:bg-emerald-50">Re-approve</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100">
            <div className="flex gap-1 p-4 border-b border-slate-100">
              {(['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'] as const).map(t => (
                <button key={t} onClick={() => setBookingTab(t)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${bookingTab === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
              ))}
            </div>
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center"><Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400">No {bookingTab.toLowerCase()} bookings</p></div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredBookings.map(b => (
                  <div key={b.id} className="p-5 hover:bg-slate-50/50">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{b.apartment?.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span>Move in: {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString() : 'ASAP'}</span>
                          <span>Applied: {timeAgo(b.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tenant Details</p>
                            <p className="font-semibold text-slate-800">{b.customerName || b.user?.name}</p>
                            <p className="text-slate-500 text-xs">{b.customerPhone || b.user?.phone}</p>
                            <p className="text-slate-500 text-xs">{b.customerEmail || b.user?.email}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Landlord Details</p>
                            <p className="font-semibold text-slate-800">{b.landlord?.name}</p>
                            <p className="text-slate-500 text-xs">{b.landlord?.phone}</p>
                            <p className="text-slate-500 text-xs">{b.landlord?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {b.status === 'PENDING' && (
                          <button onClick={() => updateBookingStatus(b.id, 'REJECTED')} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl">Moderator Reject</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
