import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-neon-indigo">
          <Home className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display font-black text-6xl text-white mb-2">404</h1>
        <p className="text-slate-300 text-lg mb-2">Page not found</p>
        <p className="text-slate-500 text-sm mb-8">This listing may have been removed or the URL is incorrect.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/listings"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
