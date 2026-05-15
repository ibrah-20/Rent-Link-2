'use client';

import { useState } from 'react';
import { Calendar, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function BookingForm({ apartmentId }: { apartmentId: string }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    moveInDate: '',
    viewingDate: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apartmentId, ...formData }),
      });

      if (res.status === 401) {
        toast.error('Please sign in to book a viewing');
        return;
      }

      if (!res.ok) throw new Error('Failed to book');
      
      setSuccess(true);
      toast.success('Booking request sent!');
    } catch (error) {
      toast.error('Failed to send booking request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (success) {
    return (
      <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <h4 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm mb-1">Request Sent!</h4>
        <p className="text-emerald-700 dark:text-emerald-500 text-xs">The landlord will review your request and get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
          <input
            type="text"
            required
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
          <input
            type="tel"
            required
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
            placeholder="0712345678"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
        <input
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
          placeholder="john@example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Move-in Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              required
              name="moveInDate"
              value={formData.moveInDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Viewing Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              name="viewingDate"
              value={formData.viewingDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message to Landlord</label>
        <textarea
          rows={3}
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="I'm interested in viewing this property..."
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Sending Request...' : 'Send Booking Request'}
      </button>
    </form>
  );
}
