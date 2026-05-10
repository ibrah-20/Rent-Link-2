'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { UnitStatusBadge } from '@/components/ui/VacancyBadge';
import { formatPrice } from '@/lib/utils';

interface Unit {
  id: string;
  unitNumber: string;
  status: 'VACANT' | 'OCCUPIED' | 'RESERVED';
  price?: number;
}

interface ApartmentDetail {
  id: string;
  name: string;
  description: string;
  pricePerMonth: number;
  totalUnits: number;
  status: string;
  amenities: string[];
  units: Unit[];
}

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [apartment, setApartment] = useState<ApartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unitSaving, setUnitSaving] = useState<string | null>(null);
  const [form, setForm] = useState({ description: '', pricePerMonth: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    fetchApartment(token);
  }, []);

  async function fetchApartment(token: string) {
    const res = await fetch(`/api/apartments/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setApartment(data.data);
      setForm({ description: data.data.description, pricePerMonth: String(data.data.pricePerMonth) });
    }
    setLoading(false);
  }

  async function saveDetails() {
    const token = localStorage.getItem('token');
    if (!token || !apartment) return;
    setSaving(true);
    const res = await fetch(`/api/apartments/${apartment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ description: form.description, pricePerMonth: parseFloat(form.pricePerMonth) }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) setSuccess('Details saved!');
    else setError(data.error || 'Failed to save');
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  }

  async function updateUnitStatus(unitId: string, status: 'VACANT' | 'OCCUPIED' | 'RESERVED') {
    const token = localStorage.getItem('token');
    if (!token || !apartment) return;
    setUnitSaving(unitId);
    const res = await fetch(`/api/apartments/${apartment.id}/units/${unitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setApartment(prev => prev ? {
        ...prev,
        units: prev.units.map(u => u.id === unitId ? { ...u, status } : u),
      } : prev);
    }
    setUnitSaving(null);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  if (!apartment) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
      Listing not found
    </div>
  );

  const vacantCount = apartment.units.filter(u => u.status === 'VACANT').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard/landlord" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-sm leading-none">{apartment.name}</h1>
            <p className="text-slate-400 text-xs mt-0.5">{apartment.status}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {success && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">{success}</div>}
        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Units', value: apartment.totalUnits, color: 'text-slate-900' },
            { label: 'Vacant', value: vacantCount, color: 'text-red-600' },
            { label: 'Price', value: formatPrice(apartment.pricePerMonth), color: 'text-indigo-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-card border border-slate-100">
              <p className={`font-display font-black text-xl ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Edit details */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
          <h2 className="font-display font-bold text-slate-900 mb-4">Edit Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monthly Price (KES)</label>
              <input
                type="number"
                value={form.pricePerMonth}
                onChange={e => setForm(p => ({ ...p, pricePerMonth: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={saveDetails}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Manage units */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
          <h2 className="font-display font-bold text-slate-900 mb-4">Manage Units</h2>
          <p className="text-slate-500 text-xs mb-4">Update each unit's status. Changes are reflected immediately on the public listing.</p>
          <div className="space-y-2">
            {apartment.units.map(unit => (
              <div key={unit.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700 text-sm">Unit {unit.unitNumber}</span>
                <div className="flex items-center gap-2">
                  {unitSaving === unit.id && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                  <div className="flex rounded-xl overflow-hidden border border-slate-200">
                    {(['VACANT', 'OCCUPIED', 'RESERVED'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => updateUnitStatus(unit.id, s)}
                        disabled={unitSaving === unit.id}
                        className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${unit.status === s
                          ? s === 'VACANT' ? 'bg-red-500 text-white'
                            : s === 'OCCUPIED' ? 'bg-orange-500 text-white'
                              : 'bg-blue-500 text-white'
                          : 'bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                      >
                        {s === 'VACANT' ? 'Vacant' : s === 'OCCUPIED' ? 'Occupied' : 'Reserved'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View public listing */}
        <div className="flex justify-center">
          <Link
            href={`/listings/${apartment.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            View Public Listing
          </Link>
        </div>
      </div>
    </div>
  );
}
