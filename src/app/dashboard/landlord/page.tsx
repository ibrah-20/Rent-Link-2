'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, LogOut, Edit, Eye, Building2, DoorOpen, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { Apartment } from '@/types';
import { formatPrice, getHouseTypeLabel, timeAgo } from '@/lib/utils';
import { VacancyBadge } from '@/components/ui/VacancyBadge';
import { pusherClient } from '@/lib/pusher-client';
import { toast } from 'react-hot-toast';

export default function LandlordDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ userId: string; name: string; email: string } | null>(null);
  const [apartments, setApartments] = useState<(Apartment & { vacantCount: number })[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<'listings' | 'bookings'>('listings');
  const [listingTab, setListingTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [bookingTab, setBookingTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'>('PENDING');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!stored || !token) { router.push('/auth/login'); return; }
      const u = JSON.parse(stored);
      if (!u || typeof u !== 'object') { router.push('/auth/login'); return; }
      setUser(u);
      fetchData(token);

      const channel = pusherClient.subscribe(`landlord-${u.userId || u.id}`);
      channel.bind('new-booking', (data: any) => {
        toast.success(`New booking request: ${data.booking.apartment?.name || 'Your apartment'}`);
        setBookings(prev => [data.booking, ...prev]);
      });

      return () => {
        pusherClient.unsubscribe(`landlord-${u.userId || u.id}`);
      };
    } catch (e) {
      console.error('Auth error:', e);
      router.push('/auth/login');
    }
  }, []);

  async function fetchData(token: string) {
    setLoading(true);
    try {
      const [aptRes, bookRes] = await Promise.all([
        fetch('/api/apartments?myListings=true', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/landlord/bookings', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (!aptRes.ok || !bookRes.ok) throw new Error('Failed to fetch data');

      const aptData = await aptRes.json();
      const bookData = await bookRes.json();
      if (aptData.success) setApartments(aptData.data);
      if (bookData.success) setBookings(bookData.data);
    } catch (e) {
      console.error('Fetch error:', e);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Booking ${status.toLowerCase()}`);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        if (status === 'APPROVED') {
          // Refresh apartments to update vacancy counts
          fetchData(token || '');
        }
      }
    } catch (e) {
      toast.error('Failed to update booking');
    }
  }

  function logout() {
    localStorage.clear();
    router.push('/');
  }

  const filteredListings = apartments.filter(a =>
    listingTab === 'all' ? true : listingTab === 'pending' ? a.status === 'PENDING' : a.status === 'APPROVED'
  );

  const filteredBookings = bookings.filter(b => b.status === bookingTab);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold">RentLink <span className="text-cyan-400">Landlord</span></span>
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
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setMainTab('listings')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${mainTab === 'listings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>My Listings</button>
          <button onClick={() => setMainTab('bookings')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${mainTab === 'bookings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            Bookings
            {bookings.filter(b => b.status === 'PENDING').length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">{bookings.filter(b => b.status === 'PENDING').length}</span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading data...</div>
        ) : mainTab === 'listings' ? (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex gap-1">
                {(['all', 'approved', 'pending'] as const).map(t => (
                  <button key={t} onClick={() => setListingTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${listingTab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
                ))}
              </div>
              <Link href="/dashboard/landlord/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-semibold shadow-sm hover:scale-105 transition-all"><Plus className="w-3.5 h-3.5" /> Add Listing</Link>
            </div>
            {filteredListings.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No listings found.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredListings.map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-slate-900 text-sm truncate">{apt.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${apt.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{apt.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{apt.neighborhood}</span>·<span>{getHouseTypeLabel(apt.houseType)}</span>·<span>{formatPrice(apt.pricePerMonth)}/mo</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <VacancyBadge vacantCount={apt.vacantCount || 0} totalUnits={apt.totalUnits} size="sm" />
                      <div className="flex items-center gap-1">
                        <Link href={`/listings/${apt.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"><Eye className="w-4 h-4" /></Link>
                        <Link href={`/dashboard/landlord/edit/${apt.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100">
            <div className="flex items-center gap-1 p-5 border-b border-slate-100">
              {(['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'] as const).map(t => (
                <button key={t} onClick={() => setBookingTab(t)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${bookingTab === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{t}</button>
              ))}
            </div>
            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No {bookingTab.toLowerCase()} bookings found.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredBookings.map(b => (
                  <div key={b.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{b.apartment?.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Move in: {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString() : 'ASAP'}</span>
                          <span>Applied: {timeAgo(b.createdAt)}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                          <p className="font-semibold text-slate-800">{b.customerName || b.user?.name}</p>
                          <p className="text-slate-500 text-xs">{b.customerPhone || b.user?.phone} · {b.customerEmail || b.user?.email}</p>
                          {b.message && <p className="mt-2 text-slate-600 italic">"{b.message}"</p>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {b.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateBookingStatus(b.id, 'APPROVED')} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                            <button onClick={() => updateBookingStatus(b.id, 'REJECTED')} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                          </>
                        )}
                        {b.status === 'APPROVED' && (
                          <button onClick={() => updateBookingStatus(b.id, 'COMPLETED')} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors">Mark Completed</button>
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
