'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Home, Search, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { href: '/listings', label: 'Browse', icon: Search },
    { href: '/map', label: 'Map View', icon: MapPin },
  ];

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-800/60'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white text-lg">
              RentLink <span className="gradient-text">Narok</span>
            </span>
          </Link>

          {/* Desktop nav - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-8">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors',
                  pathname?.startsWith(l.href)
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register?role=LANDLORD"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              List Property
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-2">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <l.icon className="w-5 h-5 text-slate-400" />
                {l.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <Link href="/auth/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <User className="w-5 h-5 text-slate-400" />
                Sign in
              </Link>
              <Link href="/auth/register?role=LANDLORD" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
                <Plus className="w-5 h-5" />
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
