'use client';

import { useState, useEffect } from 'react';
import { Star, Shield, Droplets, Wifi, Sparkles, Volume2, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  security: number;
  water: number;
  internet: number;
  cleanliness: number;
  noise: number;
  createdAt: string;
  user: {
    name: string;
    avatar: string | null;
    isVerified: boolean;
  };
}

export function ReviewsSection({ apartmentId }: { apartmentId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/apartments/${apartmentId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [apartmentId]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
          Tenant Reviews ({reviews.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ReviewForm 
              apartmentId={apartmentId} 
              onSuccess={() => {
                setShowForm(false);
                fetchReviews();
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
        {reviews.length === 0 && !loading && (
          <p className="text-slate-500 text-sm italic">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const categories = [
    { label: 'Security', value: review.security, icon: Shield },
    { label: 'Water', value: review.water, icon: Droplets },
    { label: 'Internet', value: review.internet, icon: Wifi },
    { label: 'Cleanliness', value: review.cleanliness, icon: Sparkles },
    { label: 'Noise', value: review.noise, icon: Volume2 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            {review.user.avatar ? (
              <img src={review.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.user.name}</h4>
              {review.user.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Verified Tenant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3.5 h-3.5",
                i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
        {review.comment}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 flex items-center gap-1">
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{cat.value}/5</span>
            </div>
            <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${(cat.value / 5) * 100}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ apartmentId, onSuccess }: { apartmentId: string, onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    security: 5,
    water: 5,
    internet: 5,
    cleanliness: 5,
    noise: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/apartments/${apartmentId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, ...categories }),
      });

      if (!res.ok) throw new Error('Failed to submit review');
      
      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "w-8 h-8",
                      i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detailed Ratings</label>
            <div className="space-y-4">
              {Object.entries(categories).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500 capitalize">{key}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCategories(prev => ({ ...prev, [key]: i + 1 }))}
                        className={cn(
                          "w-6 h-6 rounded-md text-[10px] font-bold transition-all",
                          i < val 
                            ? "bg-indigo-500 text-white" 
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Experience</label>
            <textarea
              required
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Tell others about the neighborhood, management, and facilities..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </div>
      </div>
    </form>
  );
}
