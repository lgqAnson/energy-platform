import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#02A7F0',
        'primary-dark': '#1A365D',
        'primary-light': '#81D3F8',
        dark: {
          900: '#0A1628',
          800: '#0F1D30',
          700: '#1A2B45',
          600: '#243755',
        },
      },
      fontFamily: {
        sans: ['Microsoft YaHei', 'PingFang SC', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
