/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add your custom colors here. This tells Tailwind to use your CSS variables.
      colors: {
        'accent': 'var(--color-accent)',
        'accent-hov': 'var(--color-accent-hov)', // Also adding the hover state for consistency
      },
    },
  },
  plugins: [],
}
