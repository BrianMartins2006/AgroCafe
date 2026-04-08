/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          teal: '#075E54',
          green: '#128C7E',
          light: '#25D366',
          blue: '#34B7F1',
          bg: '#ECE5DD',
        }
      }
    },
  },
  plugins: [],
}

