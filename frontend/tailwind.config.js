/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF9500',
        secondary: '#2A2A2A',
        'gray': {
          850: '#1f2937',
          900: '#111827',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #FF9500, 0 0 10px #FF9500, 0 0 15px #FF9500' },
          '100%': { boxShadow: '0 0 10px #FF9500, 0 0 20px #FF9500, 0 0 30px #FF9500' },
        },
      },
    },
  },
  plugins: [],
}