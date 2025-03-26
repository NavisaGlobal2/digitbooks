
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
      screens: {
        'xs': '400px',
      },
      colors: {
        primary: "#141413",
        secondary: "#828179",
        accent: "#C7FB76",
        background: "#FAFAF8",
        surface: "#fff",
        muted: "#C4C3BB",
        "muted-foreground": "#A3A299",
        border: "#E6E4DD",
        input: "#F0EFEA",
        foreground: "hsl(var(--foreground))",
        // Status colors
        success: "#10B981", // green
        warning: "#F59E0B", // yellow/amber
        info: "#3B82F6",    // blue
        error: "#EF4444",   // red/destructive
      },
      textColor: {
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["SF Pro Display", "system-ui", "sans-serif"],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "fade-in": {
          "0%": { 
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          }
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  safelist: [
    // Add common dynamic classes that might be applied conditionally
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'xs:grid-cols-1',
    'xs:grid-cols-2',
    'xs:grid-cols-3',
    'sm:grid-cols-2',
    'sm:grid-cols-3',
    'sm:grid-cols-4',
    'md:grid-cols-2',
    'md:grid-cols-3',
    'md:grid-cols-4',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    'hidden',
    'xs:hidden',
    'sm:hidden',
    'md:hidden',
    'xs:inline',
    'xs:block',
    'sm:inline',
    'sm:block',
    'md:inline',
    'md:block',
    'bg-red-500',
    'bg-yellow-500',
    'bg-green-500',
  ],
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
