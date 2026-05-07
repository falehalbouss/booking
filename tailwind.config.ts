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
          DEFAULT: "#1F4D3F",
          dark: "#143226",
          light: "#3F7A65",
          soft: "#E5EFE9",
          ink: "#0E2920",
        },
        accent: {
          DEFAULT: "#C8A36A",
          dark: "#A6864E",
          soft: "#F5EBD8",
        },
        sand: {
          DEFAULT: "#EFE7DA",
          light: "#F8F2E6",
        },
        ink: {
          DEFAULT: "#101820",
          muted: "#5C6670",
          soft: "#9AA1AA",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F7F5F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(16 24 32 / 0.04), 0 8px 24px -12px rgb(16 24 32 / 0.10)",
        lift: "0 8px 16px -4px rgb(16 24 32 / 0.10), 0 24px 40px -12px rgb(16 24 32 / 0.18)",
        ring: "0 0 0 1px rgb(16 24 32 / 0.08)",
      },
      keyframes: {
        "kenburns": {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.12) translate(-2%, -1%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        kenburns: "kenburns 18s ease-in-out infinite alternate",
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
