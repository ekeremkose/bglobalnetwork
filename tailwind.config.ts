import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#122A65",
          nav: "#0909ed"
        },
        ink: {
          DEFAULT: "#0b0b24",
          soft: "#212258"
        },
        brand: {
          50:  "#eef0ff",
          100: "#d8dbff",
          200: "#a8b0ff",
          300: "#6878ff",
          400: "#3f4eff",
          500: "#2030ff",
          600: "#1822f0",
          700: "#1018d8",
          800: "#0c14b8",
          900: "#080f90",
          950: "#050a60"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 8, 23, 0.10)",
        card: "0 16px 40px rgba(2, 8, 23, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;

