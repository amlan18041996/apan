import type { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx,md}',
    './components/**/*.{vue,js,ts,jsx,tsx,md}',
    './layouts/**/*.{vue,js,ts,jsx,tsx,md}',
    './pages/**/*.{vue,js,ts,jsx,tsx,md}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(238 242 255)',
          100: 'rgb(224 231 255)',
          200: 'rgb(199 210 254)',
          300: 'rgb(165 180 252)',
          400: 'rgb(129 140 248)',
          500: 'rgb(99 102 241)',
          600: 'rgb(79 70 229)',
          700: 'rgb(67 56 202)',
          800: 'rgb(55 48 163)',
          900: 'rgb(49 46 129)',
          950: 'rgb(30 27 75)'
        },
        secondary: {
          50: 'rgb(253 242 248)',
          100: 'rgb(252 231 243)',
          200: 'rgb(251 207 232)',
          300: 'rgb(249 168 212)',
          400: 'rgb(244 114 182)',
          500: 'rgb(236 72 153)',
          600: 'rgb(219 39 119)',
          700: 'rgb(190 24 93)',
          800: 'rgb(157 23 77)',
          900: 'rgb(131 24 67)',
          950: 'rgb(80 7 36)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgb(0 0 0 / 0.07), 0 10px 20px -2px rgb(0 0 0 / 0.04)',
        'soft-lg': '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
