/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#070709',
          50: '#1b1c24',
          100: '#15161e',
          200: '#111219',
          300: '#0d0e14',
          400: '#0a0a0f',
          500: '#070709',
          600: '#050507',
          700: '#030304',
          800: '#020203',
          900: '#000000',
        },
        gold: {
          DEFAULT: '#D4AF37',
          antique: '#D4AF37',
          warm: '#F3C64F',
          pale: '#FBE8A6',
          muted: '#8C6D27',
          dark: '#524018',
        },
        saffron: {
          DEFAULT: '#FF7700',
          dark: '#B35300',
          light: '#FFA64D',
        },
        telemetry: {
          cyan: '#00D9E8',
          cyanGlow: '#00F0FF',
          cyanDark: '#004A50',
          amber: '#F59E0B',
          red: '#EF4444',
          emerald: '#10B981',
          indigo: '#6366F1',
        },
        cosmic: {
          deep: '#060810',
          indigo: '#0b1021',
          border: 'rgba(212, 175, 55, 0.15)',
          borderSubtle: 'rgba(255, 255, 255, 0.07)',
          surface: 'rgba(11, 14, 25, 0.75)',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Cormorant Garamond', 'Marcellus', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        sanskrit: ['"Noto Sans Devanagari"', '"Yatra One"', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 30s linear infinite',
        'spin-reverse-slow': 'spin-reverse 40s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
        'cyan-glow': '0 0 20px rgba(0, 217, 232, 0.3)',
        'sacred-glow': '0 0 40px rgba(255, 119, 0, 0.2)',
      },
    },
  },
  plugins: [],
};
