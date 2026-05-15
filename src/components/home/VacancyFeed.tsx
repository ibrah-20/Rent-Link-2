'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface Vacancy {
  id: string;
  unitNumber: string;
  price: number | null;
  apartment: {
    id: string;
    name: string;
    neighborhood: string;
    pricePerMonth: number;
  };
  updatedAt: string;
}

export function VacancyFeed() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVacancies = async () => {
    try {
      const res = await fetch('/api/vacancies');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (Array.isArray(data)) {
        setVacancies(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setVacancies(data.data);
      } else {
        console.error('API did not return an array of vacancies:', data);
      }
    } catch (error) {
      console.error('Failed to fetch vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
    const interval = setInterval(fetchVacancies, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && vacancies.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[280px] h-32 bg-slate-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {vacancies.map((vacancy, index) => (
            <motion.div
              key={vacancy.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                delay: index * 0.1 
              }}
              className="min-w-[300px]"
            >
              <Link href={`/listings/${vacancy.apartment.id}`}>
                <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300">
                  <div className="absolute -top-2 -left-2">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-sm shadow-red-200 dark:shadow-none"></span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {vacancy.apartment.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {vacancy.apartment.neighborhood}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600 dark:text-cyan-400">
                        KSh {vacancy.price || vacancy.apartment.pricePerMonth}
                      </p>
                      <p className="text-[10px] text-slate-400">per month</p>
                    </div>
                  </div>
 
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                        UNIT {vacancy.unitNumber} VACANT
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(vacancy.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
 
                  <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/5 dark:group-hover:bg-cyan-500/5 transition-colors rounded-2xl pointer-events-none" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
