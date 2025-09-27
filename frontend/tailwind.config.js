/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'soft': '0 10px 25px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl2': '1.25rem'
      }
    },
  },
  plugins: [],
};
