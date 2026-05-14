import type { Metadata } from 'next';
import { Syne, Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RentLink Narok — Find Your Home in Narok, Kenya',
  description: 'Discover rental apartments, rooms, and houses in Narok, Kenya. Real-time vacancy listings with instant notifications.',
  keywords: 'rental, narok, kenya, apartment, rooms, house, vacancy, bedsitter',
  openGraph: {
    title: 'RentLink Narok',
    description: 'Find your perfect home in Narok, Kenya',
    type: 'website',
  },
};

import { Providers } from '@/components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${plusJakarta.variable} font-body antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
