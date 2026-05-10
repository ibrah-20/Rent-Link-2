/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        royal: '#2563EB',
        sky: '#38BDF8',
        emerald: { DEFAULT: '#10B981', 500: '#10B981' },
        cyan: { DEFAULT: '#06B6D4', 500: '#06B6D4' },
        violet: { DEFAULT: '#8B5CF6', 500: '#8B5CF6' },
        vacant: '#EF4444',
        occupied: '#F97316',
        available: '#10B981',
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E5E7EB',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #312E81 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(6,182,212,0.1) 100%)',
        'vacant-glow': 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow': {
          from: { boxShadow: '0 0 10px rgba(79,70,229,0.5)' },
          to: { boxShadow: '0 0 25px rgba(79,70,229,0.9), 0 0 50px rgba(79,70,229,0.3)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'card': '0 4px 24px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 12px 40px rgba(15, 23, 42, 0.15)',
        'vacant': '0 0 0 3px rgba(239, 68, 68, 0.3)',
        'neon-indigo': '0 0 20px rgba(79, 70, 229, 0.6)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
