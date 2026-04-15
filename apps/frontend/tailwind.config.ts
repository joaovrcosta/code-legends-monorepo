import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        blueGradient500:
          "linear-gradient(267deg, rgba(0,78,99,1) 0%, #00c8ff 100%)",
        gray500: "#1a1a1e",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        poppins: [
          "var(--font-poppins)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        wotfard: [
          "var(--font-wotfard)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "silver-gradient": "linear-gradient(0deg, #828282 0%, #fff 100%);",
        "blue-gradient-glow":
          "linear-gradient(0deg, rgba(12, 12, 15, 0.05) 0%, rgba(20, 30, 50, 0.39) 100%)",
        "blue-aurora": "linear-gradient(135deg, rgba(0,200,255,0.15) 0%, rgba(10,10,12,0) 50%)",
        "gray-gradient":
          "linear-gradient(0deg, rgba(32,32,32, 0.05) 0%, rgba(26,26,30, 0.39) 100%)",
        "gray-gradient-first":
          "linear-gradient(0deg, rgba(32,32,32, 0.05) 40%, rgba(123,123,138, 0.39) 100%)",
        "gray-gradient-first-full":
          "linear-gradient(0deg, rgba(32,32,32, 1) 100%, rgba(123,123,138, 1) 100%)",
        "gray-gradient-second":
          "linear-gradient(0deg, rgba(123,123,138, 0.39) 5%, rgba(32,32,32, 0.05) 100%)",
        "blue-gradient-first":
          "linear-gradient(0deg, rgba(15,15,16, 0.05) 0%, rgba(0,200,255,0.39) 100%)",
        "blue-gradient-800":
          "linear-gradient(0deg, rgba(15,15,16, 1) 0%, #005268 100%)",
        "blue-gradient-second":
          "linear-gradient(0deg, #0F0F10 0%, rgba(0,200,255,0.39) 100%)",
        "blue-gradient-inverted":
          "linear-gradient(0deg, rgba(0,200,255,0.39) 0%, #0F0F10 100%)",
        "blue-gradient-third":
          "linear-gradient(0deg, #101012 0%, #00C8FF 100%)",
        "blue-gradient-500":
          "linear-gradient(267deg, rgba(0,78,99,1) 0%, #00c8ff 100%)",
        "blue-gradient-500-inverse":
          "linear-gradient(267deg, #00c8ff 0%, rgba(0,78,99,1) 100%)",
        "orange-gradient-500":
          "linear-gradient(267deg, rgba(153,41,0,1) 0%, #FF4500 100%)",
        "red-gradient-500": "linear-gradient(267deg, #570D0D 0%, #BD1C1C 100%)",
        "lime-gradient-500":
          "linear-gradient(267deg, #6F8C0F 0%, #BFF21A 100%)",
        "purple-gradient-500":
          "linear-gradient(267deg, #39007F 0%, #6547EB 100%)",
        "yellow-lightning-500":
          "linear-gradient(267deg, #ec2352 0%, #ffb733 100%)",
        "yellow-lightning-600":
          "linear-gradient(267deg, #FFBF00 0%, #FF5900 100%)",
        "yellow-gradient-first":
          "linear-gradient(0deg, rgba(15,15,16, 0.05) 0%, rgba(255,204,0,0.39) 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "shine-pulse": {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "check-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.5)",
          },
          "70%": {
            transform: "scale(1.08)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "check-in": "check-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
