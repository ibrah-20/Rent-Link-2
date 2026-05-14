'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface FavoriteButtonProps {
  apartmentId: string;
  initialIsSaved?: boolean;
  className?: string;
}

export function FavoriteButton({ apartmentId, initialIsSaved = false, className }: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apartmentId }),
      });

      if (res.status === 401) {
        toast.error('Please sign in to save apartments');
        return;
      }

      const data = await res.json();
      setIsSaved(data.saved);
      toast.success(data.saved ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(
        "p-2 rounded-full backdrop-blur-md transition-all duration-300 active:scale-90",
        isSaved 
          ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
          : "bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-red-500",
        className
      )}
      aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
    </button>
  );
}
