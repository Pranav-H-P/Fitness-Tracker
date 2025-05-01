/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "primary-red": {
          50: "#fff0f0",
          100: "#ffdddd",
          200: "#ffc0c0",
          300: "#ff9494",
          400: "#ff5757",
          500: "#ff2323",
          600: "#ff0000",
          700: "#d70000",
          800: "#b10303",
          900: "#920a0a",
          950: "#500000",
        },
        "surface-charcoal": {
          50: "#eef9ff",
          100: "#dcf2ff",
          200: "#b2e7ff",
          300: "#6dd5ff",
          400: "#20c0ff",
          500: "#00a8ff",
          600: "#0086df",
          700: "#006ab4",
          800: "#005a95",
          900: "#004a7a",
          950: "#00101c",
        },
        "secondary-brown": {
          50: "#fef3f2",
          100: "#ffe4e1",
          200: "#ffcec8",
          300: "#ffaba1",
          400: "#fe7b6b",
          500: "#f6513d",
          600: "#e4331e",
          700: "#bf2816",
          800: "#9e2516",
          900: "#7e2318",
          950: "#470f08",
        },
      },
      boxShadow: {
        "custom-light": "0px 0px 8px rgba(0,0,0,0.6)",
        "custom-dark": "0px 0px 8px rgba(0,0,0,0.9)",
      },
    },
  },
  plugins: [],
};
