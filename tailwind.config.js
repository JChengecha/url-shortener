/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    extend: {
      colors: {
        'charcoal': '#393E46',
        'mint': '#4ECCA3',
        'light-gray': '#EEEEEE',
        'dark-gray': '#222222',
        'teal': '#045757',
        'dark-teal': '#044343',
        'off-white': '#E4E4E4',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

