/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map CSS variables so Tailwind can use them
        primary: 'var(--accent-primary)',
        'primary-hover': 'var(--accent-primary-hover)',
        secondary: 'var(--accent-secondary)',
        danger: 'var(--accent-danger)',
        warning: 'var(--accent-warning)',
        purple: 'var(--accent-purple)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
