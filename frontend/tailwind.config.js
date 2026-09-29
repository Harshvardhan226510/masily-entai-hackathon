/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#FAFAFC', // Very light, premium gray
        surface: '#FFFFFF',
        primary: {
          50: '#F0F5FF',
          100: '#E5EDFF',
          200: '#CDDBFE',
          300: '#B4C6FC',
          400: '#92A5F8',
          500: '#6366F1', // Indigo, premium SaaS standard
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        brand: {
          dark: '#0F172A',
          muted: '#64748B'
        }
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'soft': '0 10px 40px -10px rgba(0,0,0,0.03)',
        'float': '0 20px 40px -10px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
