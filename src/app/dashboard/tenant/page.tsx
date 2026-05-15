'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, CalendarDays, CheckCircle, Clock, XCircle, Building2 } from 'lucide-react';
import { pusherClient } from '@/lib/pusher-client';
import { toast } from 'react-hot-toast';

export default function TenantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!stored || !token) { router.push('/auth/login'); return; }
      const u = JSON.parse(stored);
      if (!u || typeof u !== 'object') { router.push('/auth/login'); return; }
      setUser(u);
      fetchBookings(token);

      const channel = pusherClient.subscribe(`user-${u.userId || u.id}`);
      channel.bind('booking-update', (data: any) => {
        toast.success(`Booking status updated: ${data.booking.status}`);
        setBookings(prev => prev.map(b => b.id === data.booking.id ? data.booking : b));
      });

      return () => pusherClient.unsubscribe(`user-${u.userId || u.id}`);
    } catch (e) {
      console.error('Auth error:', e);
      router.push('/auth/login');
    }
  }, []);

  async function fetchBookings(token: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.clear();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold">RentLink</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm">{user?.name}</span>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display font-black text-2xl text-slate-900">My Bookings</h1>
          <p className="text-slate-500 text-sm">Track your apartment viewing and move-in requests</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-display font-semibold text-slate-500">No bookings yet</p>
            <Link href="/listings" className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">Browse Apartments</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{b.apartment?.name}</h4>
                  <p className="text-sm text-slate-500 mb-3">{b.apartment?.address}</p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><CalendarDays className="w-3.5 h-3.5 text-indigo-500" /> Move in: {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString() : 'ASAP'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  {b.status === 'PENDING' && <span className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-600 text-xs font-bold rounded-xl border border-orange-100"><Clock className="w-3.5 h-3.5" /> Pending Review</span>}
                  {b.status === 'APPROVED' && <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>}
                  {b.status === 'REJECTED' && <span className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
                  {b.status === 'COMPLETED' && <span className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
