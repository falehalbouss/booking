import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      xs: "380px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1E3A8A",
          dark: "#172554",
          light: "#3B82F6",
          soft: "#EEF2FF",
        },
        accent: {
          DEFAULT: "#D4A24C",
          dark: "#A87E2E",
          soft: "#FBF3E2",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
