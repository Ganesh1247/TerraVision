/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070A0E',
          900: '#0B0F14',
          850: '#0F172A',
          800: '#151B23',
          750: '#1A2230',
          700: '#222F3E',
          600: '#334155',
        },
        brand: {
          cyan: '#22D3EE',
          'cyan-dark': '#06B6D4',
          'cyan-glow': 'rgba(34, 211, 238, 0.18)',
        },
        amber: {
          500: '#F59E0B',
          400: '#FBBF24',
          600: '#D97706',
          'glow': 'rgba(245, 158, 11, 0.2)',
        },
        emerald: {
          500: '#22C55E',
          400: '#4ADE80',
          'glow': 'rgba(34, 197, 94, 0.2)',
        },
        crimson: {
          500: '#EF4444',
          400: '#F87171',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(34, 211, 238, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 211, 238, 0.04) 1px, transparent 1px)",
        'radial-glow': "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%)",
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
