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
          DEFAULT: "#B5563A",
          dark: "#8C3F29",
          light: "#D4805F",
          soft: "#F4E2D6",
        },
        accent: {
          DEFAULT: "#2F4F3A",
          dark: "#1F352A",
          soft: "#E0EAE3",
        },
        sand: {
          DEFAULT: "#E8DDC9",
          light: "#F4ECDD",
        },
        ink: {
          DEFAULT: "#1F1A17",
          muted: "#5A4F47",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "Segoe UI", "Tahoma", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
