/** @type {import('tailwindcss').Config} */
// Tokens de diseño en un solo lugar. Pares texto/fondo verificados ≥ 4.5:1 (WCAG AA).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        estado: {
          perdido: { bg: '#ffe4e6', text: '#9f1239', border: '#fda4af' },
          encontrado: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
          proceso: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
          recuperado: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
          rechazada: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card: '0 1px 3px 0 rgb(15 23 42 / 0.04), 0 8px 20px -4px rgb(15 23 42 / 0.06)',
        'card-hover': '0 2px 6px 0 rgb(15 23 42 / 0.04), 0 16px 32px -8px rgb(79 70 229 / 0.18)',
        popover: '0 10px 30px -5px rgb(0 0 0 / 0.08), 0 4px 12px -2px rgb(0 0 0 / 0.04)',
        ambient: '0 1px 3px rgba(0,0,0,0.05), 0 10px 25px rgba(0,0,0,0.03)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'none' } },
        'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
      },
      animation: {
        'fade-up': 'fade-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
