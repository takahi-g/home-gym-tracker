/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          bg: '#0f172a',
          card: '#1e293b',
          cardBorder: '#334155',
          accent: '#38bdf8',
          ready: '#22c55e',
          recovering: '#ef4444',
          soon: '#eab308',
          idle: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
