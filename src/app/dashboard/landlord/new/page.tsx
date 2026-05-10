'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { NEIGHBORHOODS, AMENITIES_LIST, HOUSE_TYPE_LABELS } from '@/types';

interface UnitInput {
  unitNumber: string;
  status: 'VACANT' | 'OCCUPIED' | 'RESERVED';
  price?: number;
}

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    houseType: 'SINGLE_ROOM',
    totalUnits: 1,
    pricePerMonth: '',
    amenities: [] as string[],
    address: '',
    neighborhood: '',
    latitude: '',
    longitude: '',
  });

  const [units, setUnits] = useState<UnitInput[]>([{ unitNumber: '1', status: 'VACANT' }]);

  function addUnit() {
    setUnits(p => [...p, { unitNumber: String(p.length + 1), status: 'VACANT' }]);
  }

  function removeUnit(idx: number) {
    setUnits(p => p.filter((_, i) => i !== idx));
  }

  function toggleAmenity(a: string) {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter(x => x !== a)
        : [...p.amenities, a],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }

    const res = await fetch('/api/apartments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        pricePerMonth: parseFloat(form.pricePerMonth),
        totalUnits: units.length,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        units,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error || 'Failed to create listing');
      return;
    }

    router.push('/dashboard/landlord');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard/landlord" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-display font-bold">New Listing</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
            <h2 className="font-display font-bold text-slate-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Property Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Sunrise Apartments"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">House Type *</label>
                <select
                  required
                  value={form.houseType}
                  onChange={e => setForm(p => ({ ...p, houseType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {Object.entries(HOUSE_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monthly Price (KES) *</label>
                <input
                  required
                  type="number"
                  min="500"
                  value={form.pricePerMonth}
                  onChange={e => setForm(p => ({ ...p, pricePerMonth: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description *</label>
                <textarea
                  required
                  minLength={20}
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your property..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
            <h2 className="font-display font-bold text-slate-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Neighborhood *</label>
                <select
                  required
                  value={form.neighborhood}
                  onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select neighborhood</option>
                  {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Street Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="e.g. Near Narok Town Market"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Latitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                  placeholder="-1.0800"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Longitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                  placeholder="35.8700"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
            <h2 className="font-display font-bold text-slate-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {AMENITIES_LIST.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${form.amenities.includes(a)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Units */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-slate-900">Units ({units.length})</h2>
              <button
                type="button"
                onClick={addUnit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Unit
              </button>
            </div>
            <div className="space-y-2">
              {units.map((unit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <input
                    required
                    value={unit.unitNumber}
                    onChange={e => setUnits(p => p.map((u, i) => i === idx ? { ...u, unitNumber: e.target.value } : u))}
                    placeholder="Unit #"
                    className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-400"
                  />
                  <select
                    value={unit.status}
                    onChange={e => setUnits(p => p.map((u, i) => i === idx ? { ...u, status: e.target.value as UnitInput['status'] } : u))}
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium ${unit.status === 'VACANT' ? 'border-red-200 bg-red-50 text-red-600' : unit.status === 'RESERVED' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-orange-200 bg-orange-50 text-orange-600'}`}
                  >
                    <option value="VACANT">Vacant</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                  {units.length > 1 && (
                    <button type="button" onClick={() => removeUnit(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Link href="/dashboard/landlord" className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold text-center hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold shadow-md hover:shadow-neon-indigo transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : 'Submit for Review'}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Your listing will be reviewed by our admin team before going live. This usually takes 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
