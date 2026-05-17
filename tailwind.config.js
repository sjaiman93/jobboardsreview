/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: "#FFF5F3",
          100: "#FFE8E3",
          200: "#FFD0C7",
          300: "#FFB0A0",
          400: "#FF8B75",
          500: "#FF5630",
          600: "#E8553D",
          700: "#C4412C",
          800: "#A03522",
          900: "#7D2C1D",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        heading: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
    },
  },
  plugins: [],
};
