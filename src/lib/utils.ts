import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HouseType, HOUSE_TYPE_LABELS } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
}

export function getHouseTypeLabel(type: HouseType): string {
  return HOUSE_TYPE_LABELS[type] || type;
}

export function getVacancyColor(vacantCount: number, totalUnits: number): string {
  if (vacantCount === 0) return 'text-emerald-500';
  const ratio = vacantCount / totalUnits;
  if (ratio > 0.5) return 'text-red-500';
  return 'text-amber-500';
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}
