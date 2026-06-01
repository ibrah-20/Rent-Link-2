'use client';

import { MapPin, GraduationCap, Building2, ShoppingBag } from 'lucide-react';

interface Point {
  name: string;
  distance: string;
  time: string;
  icon: any;
}

export function LocationFeatures({ neighborhood }: { neighborhood: string }) {
  // Mock data based on Narok locations
  const points: Point[] = [
    { name: 'Maasai Mara University', distance: '1.2 km', time: '15 min walk', icon: GraduationCap },
    { name: 'Narok Town Center', distance: '2.5 km', time: '8 min drive', icon: Building2 },
    { name: 'Naivas Supermarket', distance: '2.1 km', time: '7 min drive', icon: ShoppingBag },
    { name: 'University Gate', distance: '0.5 km', time: '5 min walk', icon: MapPin },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {points.map((point) => (
        <div key={point.name} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <point.icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{point.name}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{point.distance}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{point.time}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
