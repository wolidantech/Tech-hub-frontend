/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#020a1f',
          800: '#061236',
          700: '#0a1a4a',
          600: '#10205e',
        },
        electric: {
          500: '#0ea5e9',
          600: '#0284c7',
        },
        cyan: {
          400: '#22d3ee',
          300: '#67e8f9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(14,165,233,0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(34,211,238,0.8)' },
        }
      }
    },
  },
  plugins: [],
}
