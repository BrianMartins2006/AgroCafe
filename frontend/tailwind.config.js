/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp-teal': '#008069',
        'whatsapp-green': '#25D366',
        'whatsapp-light': '#F0F2F5',
        'whatsapp-chat-bg': '#EFE7DE',
      }
    },
  },
  plugins: [],
}

