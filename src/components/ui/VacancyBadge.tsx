'use client';

import { cn } from '@/lib/utils';

interface VacancyBadgeProps {
  vacantCount: number;
  totalUnits: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VacancyBadge({ vacantCount, totalUnits, size = 'md', className }: VacancyBadgeProps) {
  if (vacantCount === 0) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-xs',
        size === 'lg' && 'px-4 py-1.5 text-sm',
        'bg-orange-100 text-orange-700 border border-orange-200',
        className
      )}>
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
        Fully Occupied
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-semibold',
      size === 'sm' && 'px-2 py-0.5 text-xs',
      size === 'md' && 'px-3 py-1 text-xs',
      size === 'lg' && 'px-4 py-1.5 text-sm',
      'bg-red-50 text-red-600 border border-red-200',
      className
    )}>
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
      </span>
      {vacantCount} Vacant {vacantCount === 1 ? 'Unit' : 'Units'}
    </span>
  );
}

interface UnitStatusBadgeProps {
  status: 'VACANT' | 'OCCUPIED' | 'RESERVED';
  unitNumber: string;
}

export function UnitStatusBadge({ status, unitNumber }: UnitStatusBadgeProps) {
  const config = {
    VACANT: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      dot: 'bg-red-500',
      label: 'Vacant',
      pulse: true,
    },
    OCCUPIED: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      dot: 'bg-emerald-500',
      label: 'Occupied',
      pulse: false,
    },
    RESERVED: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      dot: 'bg-blue-500',
      label: 'Reserved',
      pulse: false,
    },
  }[status];

  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2 rounded-lg border',
      config.bg, config.border,
      status === 'VACANT' && 'ring-1 ring-red-200 shadow-sm shadow-red-100'
    )}>
      <span className={cn('font-medium text-sm', config.text)}>Unit {unitNumber}</span>
      <span className={cn('flex items-center gap-1.5 text-xs font-semibold', config.text)}>
        <span className="relative flex w-2 h-2">
          {config.pulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          )}
          <span className={cn('relative inline-flex rounded-full w-2 h-2', config.dot)} />
        </span>
        {config.label}
      </span>
    </div>
  );
}
