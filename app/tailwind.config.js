/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8faf9',
          100: '#f1f5f3',
          200: '#dfe8e3',
          300: '#c1d4c7',
          400: '#9cb8a5',
          500: '#7a9a85',
          600: '#62806b',
          700: '#4f6856',
          800: '#425647',
          900: '#38473c',
        },
        accent: {
          50: '#fef8f3',
          100: '#fdf0e4',
          200: '#faddc4',
          300: '#f6c498',
          400: '#f1a06a',
          500: '#ec8044',
          600: '#de6529',
          700: '#b94e20',
          800: '#944020',
          900: '#77361d',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
} 