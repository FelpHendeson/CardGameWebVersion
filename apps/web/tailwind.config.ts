import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff7ed",
          500: "#f97316",
          700: "#c2410c",
          950: "#1c0a05",
        },
        veil: {
          400: "#c4b5fd",
          600: "#7c3aed",
          950: "#0b0618",
        },
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
