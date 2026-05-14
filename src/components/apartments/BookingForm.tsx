'use client';

import { useState } from 'react';
import { Calendar, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function BookingForm({ apartmentId }: { apartmentId: string }) {
  const [viewingDate, setViewingDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apartmentId, viewingDate, message }),
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
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Viewing Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            required
            value={viewingDate}
            onChange={(e) => setViewingDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message to Landlord</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I'm interested in viewing this property..."
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
