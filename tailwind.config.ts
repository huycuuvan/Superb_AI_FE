import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import lineClamp from "@tailwindcss/line-clamp";

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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6366f1", // indigo-500
          50: "#eef2ff",
          100: "#e0e7ff", 
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          foreground: "hsl(var(--primary-foreground))",
        },
        purple: {
          DEFAULT: "#9333ea", // purple-600
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff", 
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
        },
        cyan: {
          DEFAULT: "#06b6d4", // cyan-500  
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9", 
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        secondary: {
          DEFAULT: "#f1f5f9", // slate-100
          foreground: "#475569", // slate-600
          hover: "#e2e8f0", // slate-200
          light: "#f8fafc", // slate-50
          dark: "#64748b", // slate-500
        },
        accent: {
          DEFAULT: "#10b981", // emerald-500
          50: "#ecfdf5",
          100: "#d1fae5", 
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "#D2FAE1",
          foreground: "#2D3748",
          primary: "#FFF4F8",
          "primary-foreground": "#4A5568",
          accent: "#9DF1D7",
          "accent-foreground": "#2D3748",
          border: "#EBEEFC",
          ring: "#A4F5D8",
        },
        // Custom color palette based on the main colors
        theme: {
          green: {
            DEFAULT: "#D2FAE1",
            50: "#F8FAFC",
            100: "#D2FAE1",
            200: "#9DF1D7",
            300: "#A4F5D8",
            400: "#EBEEFC",
            500: "#FFF4F8",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          },
          pink: {
            DEFAULT: "#FFF4F8",
            50: "#FFF5F7",
            100: "#FFF4F8",
            200: "#EBEEFC",
            300: "#A4F5D8",
            400: "#9DF1D7",
            500: "#D2FAE1",
            600: "#D53F8C",
            700: "#B83280",
            800: "#97266D",
            900: "#702459",
          },
        },
        // Team palette colors
        teampal: {
          100: "#D2FAE1",
          200: "#FFF4F8",
          300: "#9DF1D7",
          400: "#A4F5D8",
          500: "#EBEEFC",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        rotateInfinite: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        scroll: "scroll 20s linear infinite",
        rotateInfinite: "rotateInfinite 10s linear infinite",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        rubik: ["Rubik", "sans-serif"],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            ul: {
              "margin-top": "0",
              "margin-bottom": "0",

              "list-style-type": "disc",
            },
            ol: {
              "margin-top": "0",
              "margin-bottom": "0",
            },
            li: {
              "margin-top": "0",
              "margin-bottom": "0",
            },
            "li p": {
              "margin-top": "0",
              "margin-bottom": "0",
            },
            p: {
              "margin-top": "0",
              "margin-bottom": "0",
            },
          },
        },
      }),
    },
  },
  plugins: [lineClamp, animate, typography],
} satisfies Config;
