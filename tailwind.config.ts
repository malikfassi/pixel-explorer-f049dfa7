import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        canvas: {
          bg: "#1A1F2C",
          pixel: {
            1: "#9b87f5",
            2: "#7E69AB",
            3: "#6E59A5",
            4: "#D6BCFA",
          },
        },
      },
      animation: {
        "color-shift": "colorShift 2s ease-in-out infinite",
      },
      keyframes: {
        colorShift: {
          "0%": { backgroundColor: "var(--pixel-1)" },
          "33%": { backgroundColor: "var(--pixel-2)" },
          "66%": { backgroundColor: "var(--pixel-3)" },
          "100%": { backgroundColor: "var(--pixel-1)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;