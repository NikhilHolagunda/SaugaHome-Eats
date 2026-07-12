/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        navy: '#1E2761',
        coral: '#F96167',
        gold: '#F4A261',
        'text-dark': '#1F2937',
        'text-muted': '#6B7280',
        'card-bg': '#FFFFFF',
        border: '#E5E7EB',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(30, 39, 97, 0.06)',
        card: '0 4px 20px rgba(30, 39, 97, 0.08)',
        'card-hover': '0 12px 32px rgba(30, 39, 97, 0.16)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
