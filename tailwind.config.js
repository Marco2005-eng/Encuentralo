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
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px -4px rgb(15 23 42 / 0.08)',
        'card-hover': '0 2px 4px rgb(15 23 42 / 0.06), 0 12px 32px -8px rgb(79 70 229 / 0.25)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-up': 'fade-up .35s ease-out both',
        'scale-in': 'scale-in .2s ease-out both',
      },
    },
  },
  plugins: [],
};
